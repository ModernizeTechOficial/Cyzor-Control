import { Agents } from './agents';
import { AIAgent } from './types';
import { ContextBuilder, CyzorContext } from './context/ContextBuilder';
import { ChatRequest, ChatResponse } from './types';
import { AIRouterService } from './services/AIRouterService';
import { aiStore } from './store';

export interface AIAction {
  id: string;
  label: string;
  description: string;
  agentId: string;
  promptTemplate: string;
  contextModule: CyzorContext['module'];
}

export const AIActions: Record<string, AIAction> = {
  analyzeProject: {
    id: 'analyze-project',
    label: 'Analisar Projeto',
    description: 'Avalia o status do projeto e sugere melhorias.',
    agentId: 'project-manager',
    contextModule: 'project',
    promptTemplate: 'Com base no contexto deste projeto (roadmap, backlog, equipe), faça uma análise crítica do status atual, identifique possíveis gargalos e sugira 3 ações imediatas para manter ou melhorar o ritmo de entrega.',
  },
  generateRoadmap: {
    id: 'generate-roadmap',
    label: 'Gerar Roadmap',
    description: 'Sugere um roadmap baseado no backlog.',
    agentId: 'project-manager',
    contextModule: 'project',
    promptTemplate: 'Com base no backlog e nas informações do projeto, sugira um roadmap de curto prazo (próximos 3 meses) dividindo os itens principais em marcos (milestones) lógicos.',
  },
  evaluateIdea: {
    id: 'evaluate-idea',
    label: 'Avaliar Ideia',
    description: 'Analisa riscos e potencial de mercado de uma ideia.',
    agentId: 'product-manager',
    contextModule: 'idea',
    promptTemplate: 'Analise esta ideia de produto ou negócio. Faça uma rápida análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças), aponte os 3 principais riscos de execução e sugira qual seria o melhor MVP para validá-la.',
  },
  createFinancialPlan: {
    id: 'create-financial-plan',
    label: 'Criar Plano Financeiro',
    description: 'Gera um plano de ação financeira baseado nos indicadores.',
    agentId: 'financial-advisor',
    contextModule: 'finance',
    promptTemplate: 'Analisando os indicadores financeiros atuais (MRR, burn rate, fluxo de caixa), crie um plano de ação rápido e conservador contendo recomendações para otimização de custos e maximização de faturamento no próximo trimestre.',
  },
  improveDocument: {
    id: 'improve-document',
    label: 'Melhorar Documento',
    description: 'Revisa e melhora a clareza de um documento.',
    agentId: 'documentation-assistant',
    contextModule: 'documentation',
    promptTemplate: 'Revise o conteúdo deste documento. Melhore a clareza, corrija problemas de formatação/gramática, estruture os parágrafos de forma mais legível (usando bullet points se necessário) e sugira um título mais atrativo se aplicável.',
  },
  createOKRs: {
    id: 'create-okrs',
    label: 'Criar OKRs',
    description: 'Sugere OKRs para a empresa com base em seus objetivos.',
    agentId: 'business-advisor',
    contextModule: 'company',
    promptTemplate: 'Baseado no estágio da empresa, seu score (BES) e prioridades atuais, proponha 2 Objetivos (Objectives) estratégicos para o semestre, cada um com 3 Resultados-Chave (Key Results) mensuráveis.',
  }
};

export class AIEngine {
  private router: AIRouterService;

  constructor() {
    this.router = new AIRouterService();
  }

  async executeAction(actionId: string, entityId: string, userId: string, workspaceId: string, additionalInput?: string): Promise<string> {
    const action = AIActions[actionId];
    if (!action) {
      throw new Error(`Ação de IA não encontrada: ${actionId}`);
    }

    // Always fetch the latest agent config from our Store so UI changes reflect immediately
    const storeState = aiStore.getState();
    let agent = storeState.agents.find(a => a.id === action.agentId);
    if (!agent) {
       console.warn(`Agent ${action.agentId} not found in store, falling back to default`);
       agent = Object.values(Agents).find(a => a.id === action.agentId) || Agents.WorkspaceAssistant;
    }

    const context = await ContextBuilder.buildContext(action.contextModule, entityId);
    const formattedContext = ContextBuilder.formatContextForPrompt(context);

    const finalPrompt = additionalInput 
      ? `${action.promptTemplate}\n\nDetalhes adicionais do usuário:\n${additionalInput}`
      : action.promptTemplate;

    const request: ChatRequest = {
      message: finalPrompt,
      context: { _rawString: formattedContext, ...context.data },
      userId,
      workspaceId,
      agentId: agent.id,
    };

    const response = await this.router.route(request, agent);
    
    // Log the transaction
    aiStore.logHistory({
      date: new Date().toISOString(),
      agentName: agent.name,
      provider: response.provider,
      duration: response.duration,
      tokens: response.tokensUsed,
    });
    
    return response.message;
  }
}

export const cyzorAIEngine = new AIEngine();
