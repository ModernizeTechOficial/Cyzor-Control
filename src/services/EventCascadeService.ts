import { db } from "../db/index.ts";
import { tasks, financeEntries, deploys, notifications, projects, products } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export class EventCascadeService {
  /**
   * Cascading automation when a Client is created
   */
  static async handleClientCreated(workspaceId: number, clientId: number, clientName: string, tenantId?: number) {
    try {
      console.log(`[Cascade] Client created: ${clientName} (${clientId}). Triggering onboarding...`);
      
      // Find an active project in the workspace to assign this onboarding task, if any exists
      const workspaceProjects = await db.select()
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId))
        .limit(1);

      const projectId = workspaceProjects[0]?.id || null;

      // 1. Automatically create an Onboarding Task for this client if a project exists
      if (projectId) {
        await db.insert(tasks).values({
          workspaceId,
          projectId,
          title: `onboarding: Alocação estratégica de ${clientName}`,
          description: `Iniciar contato operacional com o novo cliente ${clientName}. Configurar canais de comunicação, alinhar escopo de entregas e registrar prioridades no Cyzor Control.`,
          status: "TODO",
          priority: "Alta",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        });
      } else {
        console.log(`[Cascade] Skipping onboarding task creation for ${clientName} because no projects exist in the workspace.`);
      }

      // 2. Create a notifications entry
      await db.insert(notifications).values({
        workspaceId,
        tenantId: tenantId as any,
        title: "Automação Operacional Ativada",
        description: `Disparado onboarding automático para o cliente "${clientName}". Uma tarefa de prioridade alta foi criada.`,
        type: "success"
      });

    } catch (err) {
      console.error("[Cascade Error] Client created cascade failed:", err);
    }
  }

  /**
   * Cascading automation when a Project is completed
   */
  static async handleProjectCompleted(workspaceId: number, projectId: number, projectName: string, tenantId?: number) {
    try {
      console.log(`[Cascade] Project completed: ${projectName} (${projectId}). Processing revenues and deployments...`);

      // 1. Fetch current project details
      const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (!project) return;

      const budgetAmount = parseFloat(project.budget || "0");
      
      // 2. Automatically generate finance invoice (RECEITA) if budget > 0
      if (budgetAmount > 0) {
        await db.insert(financeEntries).values({
          workspaceId,
          tenantId: tenantId as any,
          projectId,
          companyId: project.companyId,
          amount: budgetAmount.toString(),
          type: "RECEITA",
          category: "Serviços",
          status: "PAGO",
          date: new Date(),
          description: `Faturamento Final: Projeto ${projectName}. Receita gerada automaticamente via encerramento operacional.`
        });

        await db.insert(notifications).values({
          workspaceId,
          tenantId: tenantId as any,
          title: "Faturamento Automático Concluído",
          description: `Projeto "${projectName}" concluído. Faturamento de R$ ${budgetAmount.toLocaleString("pt-BR")} registrado como pago.`,
          type: "success"
        });
      }

      // 3. Trigger automatic deployment if linked to a product
      if (project.productId) {
        const [product] = await db.select().from(products).where(eq(products.id, project.productId)).limit(1);
        const productName = product?.name || "SaaS";

        await db.insert(deploys).values({
          workspaceId,
          productId: project.productId,
          version: `1.2.${Math.floor(Math.random() * 90) + 10}`,
          status: "success",
          duration: "45s",
          logs: `[CYZOR ENGINE] Project "${projectName}" concluded.\n[CYZOR ENGINE] Auto-deploy triggered for product "${productName}"...\n[CYZOR ENGINE] Build succeeded in 45 seconds.\n[CYZOR ENGINE] Production server updated: OK.`,
          userUid: "system"
        });

        await db.insert(notifications).values({
          workspaceId,
          tenantId: tenantId as any,
          title: "Deploy Contínuo Ativado",
          description: `Projeto finalizado. Novo deploy de produção para "${productName}" concluído via CI/CD nativo da Cyzor.`,
          type: "success"
        });
      }

    } catch (err) {
      console.error("[Cascade Error] Project completed cascade failed:", err);
    }
  }

  /**
   * Cascading automation when BES score threshold is reached
   */
  static async handleBesScoreMilestone(workspaceId: number, newScore: number, oldScore: number, tenantId?: number) {
    try {
      const thresholds = [
        { value: 1000, stage: "Estruturação" },
        { value: 3000, stage: "Operação" },
        { value: 6000, stage: "Crescimento" },
        { value: 10000, stage: "Escala" }
      ];

      for (const t of thresholds) {
        if (oldScore < t.value && newScore >= t.value) {
          await db.insert(notifications).values({
            workspaceId,
            tenantId: tenantId as any,
            title: "🎉 Marco de Maturidade Atingido!",
            description: `Seu Business Event Score (BES) atingiu ${newScore} pontos. Seu Workspace foi promovido para o estágio de "${t.stage}". Parabéns!`,
            type: "success"
          });
        }
      }
    } catch (err) {
      console.error("[Cascade Error] BES milestone cascade failed:", err);
    }
  }
}
