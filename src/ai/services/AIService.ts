import { AIAgent, ChatRequest, ChatResponse } from '../types';
import { GroqProvider } from '../providers/GroqProvider';
import { aiStore } from '../store';
import { getDb } from '../../lib/firebase-admin';
import { db } from '../../db';
import { aiProviders } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class AIService {
  private static async getProvider(workspaceId: string) {
    console.log(`[AIService] Getting provider for workspaceId: ${workspaceId}`);
    // 1. Try to fetch from database (PostgreSQL)
    try {
      const wsId = parseInt(workspaceId);
      if (!isNaN(wsId)) {
        const [providerRecord] = await db.select()
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.name, 'Groq'),
              eq(aiProviders.workspaceId, wsId)
            )
          )
          .limit(1);

        if (providerRecord?.apiKey) {
          console.log(`[AIService] Found Groq API key in DB for workspace ${wsId}`);
          return new GroqProvider(providerRecord.apiKey);
        } else {
          console.log(`[AIService] No Groq API key found in DB for workspace ${wsId}`);
        }
      } else {
        console.warn(`[AIService] Invalid workspaceId for DB lookup: ${workspaceId}`);
      }
    } catch (e) {
      console.warn('[AIService] Failed to fetch provider from DB:', e);
    }

    // 2. Fallback to Environment Variable
    if (process.env.GROQ_API_KEY) {
      return new GroqProvider(process.env.GROQ_API_KEY);
    }

    // 3. Fallback to Client-side Store (local fallback if running in dev or mock context)
    const state = aiStore.getState();
    const groqProviderConfig = state.providers.find(p => p.name === 'Groq');
    const key = groqProviderConfig?.apiKey;
    
    return new GroqProvider(key || '');
  }

  private static async checkAndDeductCredits(workspaceId: string, amount: number) {
    const db = getDb();
    const creditRef = db.collection('ai_credits').doc(workspaceId);
    
    // In a real app, use a transaction for atomicity.
    const doc = await creditRef.get();
    const balance = doc.exists ? (doc.data()?.balance || 0) : 0;
    
    if (balance < amount) {
        throw new Error('Créditos insuficientes.');
    }
    
    await creditRef.set({
        balance: balance - amount,
        lastUpdated: new Date().toISOString()
    }, { merge: true });
  }

  private static async logInteraction(workspaceId: string, userId: string, agentId: string, tokens: number, action: string) {
    const db = getDb();
    await db.collection('ai_logs').add({
        workspaceId,
        userId,
        agentId,
        tokensConsumed: tokens,
        action,
        timestamp: new Date().toISOString()
    });
  }

  static async execute(request: {
    agentId: string;
    workspaceId: string;
    userId: string;
    message: string;
    context: any;
  }): Promise<{ message: string; tokensUsed: number }> {
    const COST = 10; // Simple credit model: 10 credits per request
    
    try {
      await this.checkAndDeductCredits(request.workspaceId, COST);
    } catch (e) {
      console.warn('[AIService] Failed to deduct credits, proceeding anyway:', e);
    }

    const agent: AIAgent = {
      id: request.agentId,
      name: 'Workspace Assistant',
      description: 'Workspace Assistant',
      systemPrompt: 'You are a helpful assistant.',
      modelId: 'llama-3.3-70b-versatile',
      temperature: 0.7
    };

    try {
      const provider = await this.getProvider(request.workspaceId);
      const response = await provider.generate({
        message: request.message,
        context: request.context,
        userId: request.userId,
        workspaceId: request.workspaceId,
        agentId: request.agentId,
      }, agent);

      const tokens = response.tokensUsed?.total || 0;
      try {
        await this.logInteraction(request.workspaceId, request.userId, request.agentId, tokens, 'chat');
      } catch (e) {
        console.warn('[AIService] Failed to log interaction:', e);
      }

      return {
        message: response.message,
        tokensUsed: tokens
      };
    } catch (error) {
      console.error('[AIService] Error executing AI:', error);
      throw new Error('Desculpe, ocorreu um erro ao processar sua solicitação no momento.');
    }
  }

  static async executeAction(request: {
    actionId: string;
    entityId: string;
    additionalInput?: string;
    userId: string;
    workspaceId: string;
  }): Promise<string> {
    const { actionId, entityId, additionalInput, userId, workspaceId } = request;
    const { AIActions } = await import('../AIEngine');
    const { Agents } = await import('../agents');
    const { ContextBuilder } = await import('../context/ContextBuilder');

    const action = AIActions[actionId];
    if (!action) {
      throw new Error(`Ação de IA não encontrada: ${actionId}`);
    }

    let agent = Object.values(Agents).find(a => a.id === action.agentId);
    if (!agent) {
       agent = {
         id: action.agentId,
         name: 'Agent',
         description: 'AI Agent',
         systemPrompt: 'You are a helpful assistant.',
         modelId: 'llama-3.3-70b-versatile',
         temperature: 0.7
       };
    }

    const context = await ContextBuilder.buildContext(action.contextModule, entityId);
    const formattedContext = ContextBuilder.formatContextForPrompt(context);

    const finalPrompt = additionalInput 
      ? `${action.promptTemplate}\n\nDetalhes adicionais do usuário:\n${additionalInput}`
      : action.promptTemplate;

    const provider = await this.getProvider(workspaceId);
    const response = await provider.generate({
      message: finalPrompt,
      context: { _rawString: formattedContext, ...context.data },
      userId,
      workspaceId,
      agentId: agent.id,
    }, agent);

    const tokens = response.tokensUsed?.total || 0;
    try {
      await this.logInteraction(workspaceId, userId, agent.id, tokens, 'action');
    } catch (e) {
      console.warn('[AIService] Failed to log action interaction:', e);
    }

    return response.message;
  }
}
