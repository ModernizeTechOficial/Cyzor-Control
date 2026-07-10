import { db } from "../db/index.ts";
import { projects, products, ideas, clients, financeEntries, tasks, notifications } from "../db/schema.ts";

export class WorkspaceTemplateService {
  static async applyTemplate(workspaceId: number, segment: string, tenantId?: number) {
    try {
      console.log(`[Template] Applying segment template "${segment}" to workspace ${workspaceId}`);

      if (segment === "SaaS") {
        // 1. Create a Product
        const [product] = await db.insert(products).values({
          workspaceId,
          tenantId: tenantId as any,
          name: "Plataforma SaaS Cyzor Hub",
          description: "Sistema inteligente para orquestração de operações B2B e automação empresarial.",
          status: "Em Desenvolvimento",
          type: "SaaS",
          pricingModel: "Assinatura",
          launchDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
        }).returning();

        // 2. Create a Company/Client
        const [client] = await db.insert(clients).values({
          workspaceId,
          name: "Ana Cunha (Tech Ventures)",
          email: "ana.cunha@techventures.com",
          phone: "(11) 98765-4321",
          status: "Ativo",
          role: "Investidora / Parceria",
          notes: "Contato prioritário de relacionamento institucional e investidores."
        }).returning();

        // 3. Create a Project
        const [project] = await db.insert(projects).values({
          workspaceId,
          name: "Lançamento do MVP - Cyzor Hub",
          priority: "Alta",
          status: "planejamento",
          budget: "25000",
          owner: "Guilherme Santos",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          productId: product.id
        }).returning();

        // 4. Create typical SaaS Tasks
        await db.insert(tasks).values([
          {
            workspaceId,
            projectId: project.id,
            title: "Desenvolver Autenticação Single Sign-On (SSO)",
            description: "Implementar login seguro via Google Workspace e SSO corporativo.",
            status: "TODO",
            priority: "Alta"
          },
          {
            workspaceId,
            projectId: project.id,
            title: "Configurar Checkout do Stripe",
            description: "Integrar cobrança recorrente, planos SaaS e checkout seguro.",
            status: "TODO",
            priority: "Alta"
          },
          {
            workspaceId,
            projectId: project.id,
            title: "Mapear Arquitetura do Banco de Dados",
            description: "Modelar o banco de dados relacional e migrações.",
            status: "DONE",
            priority: "Média"
          }
        ]);

        // 5. Create Product Ideas
        await db.insert(ideas).values([
          {
            workspaceId,
            title: "Módulo de IA para Geração de Relatórios",
            description: "Adicionar consultor virtual que gera PDFs de DRE via comando de voz.",
            status: "capturadas",
            analysis: { impact: 9, effort: 6 } as any
          },
          {
            workspaceId,
            title: "Painel de Métricas SaaS (MRR / Churn)",
            description: "Painel executivo com gráficos nativos de saúde financeira do SaaS.",
            status: "avaliacao",
            analysis: { impact: 10, effort: 4 } as any
          }
        ]);

      } else if (segment === "Serviços") {
        // 1. Create a Product / Service Product
        const [product] = await db.insert(products).values({
          workspaceId,
          tenantId: tenantId as any,
          name: "Consultoria Executiva de Business OS",
          description: "Programa de transformação operacional e orquestração de fluxos para empresas.",
          status: "Ativo",
          type: "Serviço",
          pricingModel: "Por Projeto",
          launchDate: new Date()
        }).returning();

        // 2. Create Client
        const [client] = await db.insert(clients).values({
          workspaceId,
          name: "Carlos Ribeiro (Varejo Total)",
          email: "carlos.ribeiro@varejototal.com.br",
          phone: "(11) 99122-3344",
          status: "Ativo",
          role: "Diretor Comercial",
          notes: "Cliente principal do contrato de reestruturação operacional."
        }).returning();

        // 3. Create a Project
        const [project] = await db.insert(projects).values({
          workspaceId,
          name: "Consultoria Operacional - Varejo Total",
          priority: "Alta",
          status: "planejamento",
          budget: "45000",
          owner: "Mariana Costa",
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
          productId: product.id
        }).returning();

        // 4. Create Tasks
        await db.insert(tasks).values([
          {
            workspaceId,
            projectId: project.id,
            title: "Workshop de Mapeamento de Processos",
            description: "Realizar sessão colaborativa para desenhar os fluxos de trabalho atuais.",
            status: "TODO",
            priority: "Alta"
          },
          {
            workspaceId,
            projectId: project.id,
            title: "Entrega do Relatório de Auditoria",
            description: "Consolidar o diagnóstico e oportunidades identificadas nos fluxos de venda.",
            status: "TODO",
            priority: "Alta"
          },
          {
            workspaceId,
            projectId: project.id,
            title: "Alinhamento Inicial de Escopo",
            description: "Definir cronograma e metas chaves com Carlos Ribeiro.",
            status: "DONE",
            priority: "Média"
          }
        ]);

        // 5. Create Ideas
        await db.insert(ideas).values([
          {
            workspaceId,
            title: "Modelo de Proposta Comercial Automatizada",
            description: "Criar uma planilha inteligente que gera propostas comerciais em segundos.",
            status: "capturadas",
            analysis: { impact: 8, effort: 2 } as any
          }
        ]);

      } else if (segment === "E-commerce") {
        // 1. Create a Product / Store Product
        const [product] = await db.insert(products).values({
          workspaceId,
          tenantId: tenantId as any,
          name: "Plataforma de E-commerce Cyzor Store",
          description: "Canal de vendas digitais integrado com controle de estoque e logística.",
          status: "Ativo",
          type: "Físico / Digital",
          pricingModel: "Transacional",
          launchDate: new Date()
        }).returning();

        // 2. Create Client
        const [client] = await db.insert(clients).values({
          workspaceId,
          name: "Distribuidora de Tecidos Alfa",
          email: "compras@tecidosalfa.com",
          phone: "(21) 3222-1111",
          status: "Ativo",
          role: "Distribuidor B2B",
          notes: "Grande parceiro de suprimentos e mercadorias físicas."
        }).returning();

        // 3. Create a Project
        const [project] = await db.insert(projects).values({
          workspaceId,
          name: "Lançamento da Campanha de Inverno",
          priority: "Média",
          status: "planejamento",
          budget: "8000",
          owner: "Felipe Melo",
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
          productId: product.id
        }).returning();

        // 4. Create Tasks
        await db.insert(tasks).values([
          {
            workspaceId,
            projectId: project.id,
            title: "Produção de Criativos de Anúncios",
            description: "Criar banners e vídeos patrocinados para as redes sociais.",
            status: "TODO",
            priority: "Alta"
          },
          {
            workspaceId,
            projectId: project.id,
            title: "Configurar pixel de conversão",
            description: "Instalar tags de rastreamento no checkout para otimização de anúncios.",
            status: "TODO",
            priority: "Média"
          }
        ]);

        // 5. Create Ideas
        await db.insert(ideas).values([
          {
            workspaceId,
            title: "Recuperação de Carrinho via WhatsApp",
            description: "Configurar agente automatizado que envia descontos para carrinhos abandonados.",
            status: "capturadas",
            analysis: { impact: 10, effort: 3 } as any
          }
        ]);
      }

      // Add a template applied notification
      await db.insert(notifications).values({
        workspaceId,
        tenantId: tenantId as any,
        title: "Workspace Inicializado",
        description: `Seu Workspace foi configurado com o template de "${segment}". Explore as ideias, tarefas, projetos e produtos criados para acelerar sua jornada!`,
        type: "success"
      });

    } catch (err) {
      console.error("[Template Error] Workspace template application failed:", err);
    }
  }
}
