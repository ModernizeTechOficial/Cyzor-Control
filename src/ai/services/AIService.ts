import { AIAgent, ChatRequest, ChatResponse } from '../types';
import { GroqProvider } from '../providers/GroqProvider';
import { db } from '../../db';
import { aiProviders, aiHistory } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export class AIService {
  private static async getProvider(workspaceId: string, tenantId?: string) {
    console.log(`[AIService] Getting provider for workspaceId: ${workspaceId}, tenantId: ${tenantId}`);
    // 1. Fetch from database (PostgreSQL)
    try {
      const wsId = parseInt(workspaceId);
      if (!isNaN(wsId)) {
        // Try to find an enabled provider for this workspace
        const [providerRecord] = await db.select()
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.workspaceId, wsId),
              eq(aiProviders.enabled, true)
            )
          )
          .limit(1);

        if (providerRecord?.apiKey) {
          console.log(`[AIService] Found ${providerRecord.name} API key in DB for workspace ${wsId}`);
          // For now we only have GroqProvider implemented, but we should handle Gemini too.
          // Let's assume Groq if not specified or fallback to a generic provider logic.
          return new GroqProvider(providerRecord.apiKey);
        } else {
          console.log(`[AIService] No enabled AI provider found in DB for workspace ${wsId}, checking tenant...`);
        }
      } else {
        console.warn(`[AIService] Invalid workspaceId for DB lookup: ${workspaceId}`);
      }

      // Fallback to tenant level config
      if (tenantId) {
        const [tenantProvider] = await db.select()
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.tenantId, tenantId),
              eq(aiProviders.enabled, true)
            )
          )
          .limit(1);

        if (tenantProvider?.apiKey) {
           console.log(`[AIService] Found ${tenantProvider.name} API key in DB for tenant ${tenantId}`);
           return new GroqProvider(tenantProvider.apiKey);
        }
      }
    } catch (e) {
      console.warn('[AIService] Failed to fetch provider from DB:', e);
    }

    // Retorna Groq sem chave para gerar o erro adequado para o front-end pedindo configuração
    return new GroqProvider('');
  }

  private static async checkAndDeductCredits(workspaceId: string, amount: number) {
    // TODO: Migrate credit system to PostgreSQL
    // Firebase code removed to fix PERMISSION_DENIED issues in production
    return Promise.resolve();
  }

  private static async logInteraction(workspaceId: string, userId: string, agentId: string, tokens: number, action: string, prompt: string, response: string, tenantId?: string) {
    try {
      const wsId = parseInt(workspaceId);
      if (isNaN(wsId)) return;
      
      await db.insert(aiHistory).values({
        workspaceId: wsId,
        userUid: userId,
        prompt: prompt.substring(0, 5000), // Ensure we don't exceed any reasonable limits if not set
        response: response.substring(0, 5000),
        contextType: action,
        tenantId: tenantId || undefined
      });
    } catch (e) {
       console.warn('[AIService] Failed to log interaction to DB:', e);
    }
  }

  static async execute(request: {
    agentId: string;
    workspaceId: string;
    userId: string;
    message: string;
    context: any;
    tenantId?: string;
    overrideAgent?: AIAgent;
  }): Promise<{ message: string; tokensUsed: number }> {
    const COST = 10; // Simple credit model: 10 credits per request
    
    try {
      await this.checkAndDeductCredits(request.workspaceId, COST);
    } catch (e) {
      console.warn('[AIService] Failed to deduct credits, proceeding anyway:', e);
    }

    let agent: AIAgent = request.overrideAgent || {
      id: request.agentId,
      name: 'Workspace Assistant',
      description: 'Workspace Assistant',
      systemPrompt: 'Você é um assistente prestativo.',
      modelId: 'llama-3.3-70b-versatile',
      temperature: 0.7
    };

    try {
      const provider = await this.getProvider(request.workspaceId, request.tenantId);
      const response = await provider.generate({
        message: request.message,
        context: request.context,
        userId: request.userId,
        workspaceId: request.workspaceId,
        agentId: request.agentId,
      }, agent);

      const tokens = response.tokensUsed?.total || 0;
      try {
        await this.logInteraction(request.workspaceId, request.userId, request.agentId, tokens, 'chat', request.message, response.message, request.tenantId);
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
    tenantId?: string;
    overrideAgent?: AIAgent;
  }): Promise<string> {
    const { actionId, entityId, additionalInput, userId, workspaceId, tenantId, overrideAgent } = request;
    const { AIActions } = await import('../AIEngine');
    const { Agents } = await import('../agents');
    const { ContextBuilder } = await import('../context/ContextBuilder');

    const action = AIActions[actionId];
    if (!action) {
      throw new Error(`Ação de IA não encontrada: ${actionId}`);
    }

    let agent = overrideAgent || Object.values(Agents).find(a => a.id === action.agentId);
    if (!agent) {
       agent = {
         id: action.agentId,
         name: 'Agent',
         description: 'AI Agent',
         systemPrompt: 'Você é um assistente prestativo.',
         modelId: 'llama-3.3-70b-versatile',
         temperature: 0.7
       };
    }

    const context = await ContextBuilder.buildContext(action.contextModule, entityId);
    const formattedContext = ContextBuilder.formatContextForPrompt(context);

    const finalPrompt = additionalInput 
      ? `${action.promptTemplate}\n\nDetalhes adicionais do usuário:\n${additionalInput}`
      : action.promptTemplate;

    const provider = await this.getProvider(workspaceId, tenantId);
    const response = await provider.generate({
      message: finalPrompt,
      context: { _rawString: formattedContext, ...context.data },
      userId,
      workspaceId,
      agentId: agent.id,
    }, agent);

    const tokens = response.tokensUsed?.total || 0;
    try {
      await this.logInteraction(workspaceId, userId, agent.id, tokens, actionId, finalPrompt, response.message, tenantId);
    } catch (e) {
      console.warn('[AIService] Failed to log action interaction:', e);
    }

    return response.message;
  }
}
