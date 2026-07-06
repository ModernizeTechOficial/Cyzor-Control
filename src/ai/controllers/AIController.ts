import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { AIService } from '../services/AIService';
import { db } from '../../db';
import { companies, projects, tasks, ideas, financeEntries } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

export class AIController {
  static async chat(req: AuthRequest, res: Response) {
    try {
      const { message, prompt, context = {}, agentId, overrideAgent, history } = req.body;
      const actualMessage = message || prompt;
      
      const wsId = req.workspaceId ? parseInt(req.workspaceId.toString()) : NaN;
      
      let cyzorContext = "Informações sobre os dados atuais do usuário indisponíveis.";
      
      if (!isNaN(wsId)) {
        try {
          const wsCompanies = await db.select().from(companies).where(eq(companies.workspaceId, wsId));
          const wsProjects = await db.select().from(projects).where(eq(projects.workspaceId, wsId));
          const wsTasks = await db.select().from(tasks).where(eq(tasks.workspaceId, wsId));
          const wsIdeas = await db.select().from(ideas).where(eq(ideas.workspaceId, wsId));
          const wsFinance = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, wsId));
          
          const companiesStr = wsCompanies.length > 0 
            ? wsCompanies.map(c => `- ${c.name} (CNPJ: ${c.cnpj || 'Não cadastrado'}, Setor: ${c.industry || 'N/A'}, Status: ${c.status})`).join('\n')
            : 'Nenhuma empresa cadastrada.';
            
          const projectsStr = wsProjects.length > 0
            ? wsProjects.map(p => {
                const projectComp = wsCompanies.find(c => c.id === p.companyId);
                const companyName = projectComp ? projectComp.name : 'Nenhuma';
                return `- ${p.name} [ID: ${p.id}] (Status: ${p.status}, Prioridade: ${p.priority}, Progresso: ${p.progress}%, Empresa Relacionada: ${companyName})`;
              }).join('\n')
            : 'Nenhum projeto cadastrado.';
            
          const tasksStr = wsTasks.length > 0
            ? wsTasks.map(t => {
                const taskProj = wsProjects.find(p => p.id === t.projectId);
                const projName = taskProj ? taskProj.name : 'Nenhum';
                return `- ${t.title} (Status: ${t.status}, Prioridade: ${t.priority}, Projeto: ${projName})`;
              }).join('\n')
            : 'Nenhuma tarefa cadastrada.';
            
          const ideasStr = wsIdeas.length > 0
            ? wsIdeas.map(i => `- ${i.title} (Status: ${i.status}, Prioridade: ${i.priority}, Descrição: ${i.description || 'N/A'})`).join('\n')
            : 'Nenhuma ideia cadastrada.';
            
          const financeStr = wsFinance.length > 0
            ? wsFinance.map(f => `- [${f.type}] ${f.description} - R$ ${parseFloat(f.amount.toString()).toFixed(2)} (Status: ${f.status}, Data: ${f.date ? new Date(f.date).toLocaleDateString('pt-BR') : 'N/A'})`).join('\n')
            : 'Nenhuma movimentação financeira cadastrada.';

          cyzorContext = `CONTEXTO REAL E COMPLETO DA CYZOR CONTROL (WORKSPACE ATUAL):

--- EMPRESAS CADASTRADAS ---
${companiesStr}

--- PROJETOS EM ANDAMENTO/PLANEJAMENTO ---
${projectsStr}

--- TAREFAS / BACKLOG ---
${tasksStr}

--- BANCO DE IDEIAS ---
${ideasStr}

--- HISTÓRICO E FLUXO FINANCEIRO ---
${financeStr}

(Todos esses dados são reais, atuais e estão armazenados no banco de dados do workspace do usuário neste exato momento. Use essas informações detalhadas para responder às perguntas do usuário com precisão, citando nomes, status e valores reais.)`;
        } catch (dbErr) {
          console.error('AIController fetch context error:', dbErr);
        }
      }
      
      const finalContext = {
        ...context,
        history: history || context.history || [],
        _rawString: context._rawString ? `${cyzorContext}\n\n${context._rawString}` : cyzorContext
      };
      
      const response = await AIService.execute({
        message: actualMessage,
        context: finalContext,
        userId: req.user?.uid || 'anonymous', 
        workspaceId: req.workspaceId?.toString() || 'default',
        tenantId: req.tenantId || 'default',
        agentId: agentId || 'workspace-assistant',
        overrideAgent
      });
      
      res.json({
        ...response,
        text: response.message
      });
    } catch (error) {
      console.error('AIController chat error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI processing failed' });
    }
  }

  static async executeAction(req: AuthRequest, res: Response) {
    try {
      const { actionId, entityId, additionalInput, overrideAgent } = req.body;
      const response = await AIService.executeAction({
        actionId,
        entityId,
        additionalInput,
        userId: req.user?.uid || 'anonymous',
        workspaceId: req.workspaceId?.toString() || 'default',
        tenantId: req.tenantId || 'default',
        overrideAgent
      });
      res.json({ text: response, message: response });
    } catch (error) {
      console.error('AIController executeAction error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'AI Action failed' });
    }
  }
}
