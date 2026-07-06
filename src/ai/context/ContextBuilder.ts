import { db } from '../../db';
import { 
  workspaces, 
  projects, 
  products, 
  ideas, 
  financeEntries, 
  tasks,
  clients,
  companies
} from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export interface CyzorContext {
  module: 'project' | 'product' | 'finance' | 'company' | 'idea' | 'documentation' | 'workspace' | 'global';
  entityId?: string;
  data: Record<string, any>;
}

export class ContextBuilder {
  static async buildContext(workspaceId: number, module: CyzorContext['module'] = 'global', entityId?: string): Promise<CyzorContext> {
    const data: Record<string, any> = {};

    try {
      // General Workspace info (Always fetch)
      const [workspaceInfo] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
      data.workspaceInfo = workspaceInfo || { name: 'Unknown Workspace' };

      // Load specific context based on module or 'global' to load summaries
      if (module === 'global' || module === 'workspace') {
        const wsProjects = await db.select({ name: projects.name, status: projects.status }).from(projects).where(eq(projects.workspaceId, workspaceId)).limit(5);
        const wsProducts = await db.select({ name: products.name, status: products.status }).from(products).where(eq(products.workspaceId, workspaceId)).limit(5);
        const wsClients = await db.select({ name: clients.name, status: clients.status }).from(clients).where(eq(clients.workspaceId, workspaceId)).limit(5);
        const wsIdeas = await db.select({ title: ideas.title, status: ideas.status }).from(ideas).where(eq(ideas.workspaceId, workspaceId)).limit(5);
        const wsFinance = await db.select({ amount: financeEntries.amount, type: financeEntries.type, category: financeEntries.category }).from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId)).orderBy(desc(financeEntries.date)).limit(10);
        
        data.summary = {
          projects: wsProjects,
          products: wsProducts,
          clients: wsClients,
          ideas: wsIdeas,
          recentFinance: wsFinance
        };
      } else if (module === 'project') {
        if (entityId) {
           const [projectData] = await db.select().from(projects).where(eq(projects.id, parseInt(entityId))).limit(1);
           data.project = projectData;
           if (projectData) {
              data.tasks = await db.select().from(tasks).where(eq(tasks.projectId, projectData.id)).limit(10);
           }
        } else {
           data.projects = await db.select().from(projects).where(eq(projects.workspaceId, workspaceId)).limit(10);
        }
      } else if (module === 'finance') {
         const entries = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId)).orderBy(desc(financeEntries.date)).limit(20);
         data.finance = entries;
      } else if (module === 'product') {
         data.products = await db.select().from(products).where(eq(products.workspaceId, workspaceId)).limit(10);
      } else if (module === 'company') {
         data.companies = await db.select().from(companies).where(eq(companies.workspaceId, workspaceId)).limit(10);
      }

    } catch (e) {
       console.warn('[ContextBuilder] Error building context:', e);
       data.error = 'Failed to load specific context data from database.';
    }

    return {
      module,
      entityId,
      data,
    };
  }

  static formatContextForPrompt(context: CyzorContext): string {
    return `[CONTEXTO EMPRESARIAL - CYZOR CONTROL]
Abaixo estão os dados reais do workspace atual. Nunca diga ao usuário que você não conhece a empresa ou que não tem contexto. Use esses dados como fonte de verdade para embasar suas respostas.

Workspace ID: ${context.data.workspaceInfo?.id}
Nome do Workspace: ${context.data.workspaceInfo?.name}
Módulo de Foco: ${context.module}

Dados Relevantes do Sistema:
${JSON.stringify(context.data, null, 2)}
[/CONTEXTO EMPRESARIAL]`;
  }
}
