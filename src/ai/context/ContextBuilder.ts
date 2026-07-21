export interface CyzorContext {
  module: 'project' | 'product' | 'finance' | 'company' | 'idea' | 'documentation' | 'workspace';
  entityId?: string;
  data: Record<string, any>;
}

export class ContextBuilder {
  /**
   * Constrói o contexto com base no módulo atual e ID da entidade.
   * Em uma implementação real, isso buscaria dados do banco de dados (Firestore)
   * ou do estado global da aplicação (ex: Zustand/Redux).
   */
  static async buildContext(module: CyzorContext['module'], entityId?: string): Promise<CyzorContext> {
    const data: Record<string, any> = {};

    switch (module) {
      case 'project':
        // Simulação de busca de dados do projeto
        data.project = { id: entityId, name: 'Projeto Alpha', status: 'Em andamento' };
        data.roadmap = ['Milestone 1', 'Milestone 2'];
        data.backlog = ['Task A', 'Task B', 'Task C'];
        data.team = ['User 1', 'User 2'];
        data.sprint = 'Sprint 4';
        break;
      case 'finance':
        data.metrics = { mrr: 15000, churn: '2%', burnRate: 5000 };
        data.cashflow = { pendingIncomes: 20000, pendingExpenses: 8000 };
        break;
      case 'product':
        data.product = { id: entityId, name: 'Produto X', stage: 'MVP' };
        data.features = ['Feature A', 'Feature B'];
        data.releases = ['v1.0 (Lançada)', 'v1.1 (Planejada)'];
        break;
      case 'company':
        data.company = { id: entityId, name: 'Acme Corp', industry: 'SaaS' };
        data.professionalEvolution = { xp: 75, stage: 'Engajado' };
        data.priorities = ['Aumentar retenção', 'Lançar v2'];
        break;
      default:
        data.info = 'Contexto geral do Workspace';
        break;
    }

    return {
      module,
      entityId,
      data,
    };
  }

  /**
   * Formata o contexto estruturado em uma string que a IA possa entender.
   */
  static formatContextForPrompt(context: CyzorContext): string {
    return `[CONTEXTO ATUAL DO USUÁRIO]
Módulo: ${context.module}
Entidade ID: ${context.entityId || 'N/A'}
Dados do Contexto:
${JSON.stringify(context.data, null, 2)}
[/CONTEXTO ATUAL DO USUÁRIO]`;
  }
}
