import { View } from '../types';

interface StrategicPriority {
  title: string;
  description: string;
  impact: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
  actionLabel: string;
  view: View;
}

export function calculateStrategicPriority(params: {
  currentStage: string;
  ideas: any[];
  projects: any[];
  products: any[];
  clients: any[];
  finance: any[];
  tasks: any[];
}): StrategicPriority {
  const { currentStage, ideas, projects, products, clients, finance, tasks } = params;

  // 1. DISCOVERY STAGES (Ideia, Validação)
  if (currentStage === 'Ideia') {
    if (ideas.length === 0) {
      return {
        title: "Modelar e conceituar sua primeira proposta de valor",
        description: "Analisamos seu workspace e identificamos que você ainda não registrou nenhuma proposta ou tese comercial no Banco de Ideias. Inicie documentando sua premissa central.",
        impact: "Muito Alto",
        actionLabel: "Cadastrar Ideia",
        view: "ideias"
      };
    }
    return {
      title: "Validar hipóteses qualitativas com potenciais clientes",
      description: "Sua ideia inicial está bem definida no banco de dados, mas é fundamental mapear a dor do público-alvo e registrar hipóteses claras de solução antes de iniciar qualquer desenvolvimento.",
      impact: "Alto",
      actionLabel: "Ver Banco de Ideias",
      view: "ideias"
    };
  }

  if (currentStage === 'Validação') {
    if (clients.length === 0) {
      return {
        title: "Cadastrar perfis de clientes ideais para entrevistas",
        description: "Para validar a dor mapeada em sua proposta de valor, você precisa qualificar leads e agendar conversas qualitativas. Adicione os primeiros perfis de potenciais compradores.",
        impact: "Alto",
        actionLabel: "Cadastrar Clientes",
        view: "clientes"
      };
    }
    return {
      title: "Consolidar insights de entrevistas e feedbacks",
      description: "Você já possui perfis de clientes mapeados. Use a Consultora de IA para compilar as respostas das pesquisas e avaliar se há de fato um Product-Market Fit inicial.",
      impact: "Alto",
      actionLabel: "Consultar IA",
      view: "ia"
    };
  }

  // 2. CONSTRUCTION STAGES (Projeto, Planejamento, Desenvolvimento)
  if (currentStage === 'Projeto') {
    if (projects.length === 0) {
      return {
        title: "Estruturar o projeto e escopo do seu MVP",
        description: "Após a validação conceitual, é necessário traduzir o modelo em um plano de entrega ágil. Crie seu projeto central e defina as metas fundamentais de progresso.",
        impact: "Muito Alto",
        actionLabel: "Criar Projeto",
        view: "projetos"
      };
    }
    return {
      title: "Definir marcos de entrega (Milestones) para o projeto",
      description: "Seu projeto está criado no workspace, mas falta detalhar os marcos principais de entrega técnica para guiar o esforço operacional de forma organizada.",
      impact: "Alto",
      actionLabel: "Gerenciar Projetos",
      view: "projetos"
    };
  }

  if (currentStage === 'Planejamento') {
    const totalTasks = tasks.length;
    if (totalTasks === 0) {
      return {
        title: "Construir e refinar o Backlog de Tarefas do MVP",
        description: "Seu projeto executivo está no ar, mas você ainda não desmembrou o escopo em tarefas acionáveis. Cadastre as primeiras tarefas operacionais no quadro ágil.",
        impact: "Muito Alto",
        actionLabel: "Planejar Backlog",
        view: "projetos"
      };
    }
    if (totalTasks < 5) {
      return {
        title: "Detalar tarefas táticas para as próximas entregas",
        description: "Você possui apenas algumas tarefas cadastradas. Recomendamos detalhar prazos, prioridades e estimativas de esforço para que a equipe execute com sincronia.",
        impact: "Alto",
        actionLabel: "Estruturar Tarefas",
        view: "projetos"
      };
    }
    return {
      title: "Montar seu cronograma e roteiro de sprints",
      description: "Com o backlog devidamente mapeado, organize os prazos de execução para que as sprints correspondam às expectativas de entrega do seu MVP.",
      impact: "Médio",
      actionLabel: "Ver Sprints",
      view: "projetos"
    };
  }

  if (currentStage === 'Desenvolvimento') {
    const pendingTasks = tasks.filter(t => t.status !== 'CONCLUIDO' && t.status !== 'DONE').length;
    if (pendingTasks > 0) {
      return {
        title: "Priorizar a conclusão de tarefas críticas do desenvolvimento",
        description: `Há ${pendingTasks} tarefas pendentes em seu backlog. Foque o esforço técnico em fechar esses itens para colocar o MVP operacional o quanto antes.`,
        impact: "Muito Alto",
        actionLabel: "Ver Backlog Técnico",
        view: "projetos"
      };
    }
    return {
      title: "Efetuar testes integrados e documentar fluxos de uso",
      description: "As tarefas técnicas principais parecem em dia. Agora é o momento de validar fluxos ponta a ponta e estruturar playbooks de usabilidade na Documentação.",
      impact: "Alto",
      actionLabel: "Registrar Documentos",
      view: "documentacao"
    };
  }

  // 3. SCALE STAGES (Produto, Clientes, Financeiro, Crescimento, Gestão)
  if (currentStage === 'Produto') {
    if (products.length === 0) {
      return {
        title: "Cadastrar seus produtos e serviços comerciais",
        description: "Seu produto físico ou software está pronto. Mapeie agora sua oferta no catálogo do sistema, estipulando preços, planos de assinatura e regras comerciais.",
        impact: "Muito Alto",
        actionLabel: "Cadastrar Produto",
        view: "produtos"
      };
    }
    return {
      title: "Definir canais de aquisição e modelo de pricing",
      description: "Você já possui produtos em catálogo. Use a Consultora IA para refinar suas taxas, estimar o custo de aquisição (CAC) sugerido e estruturar sua proposta de vendas.",
      impact: "Alto",
      actionLabel: "Consultar IA Comercial",
      view: "ia"
    };
  }

  if (currentStage === 'Clientes') {
    const totalClients = clients.length;
    if (totalClients === 0) {
      return {
        title: "Ativar prospecção comercial e cadastrar os primeiros leads",
        description: "Sua oferta está madura, mas você não registrou nenhum cliente ativo ou lead de vendas. Inicie o cadastramento de contatos no CRM para iniciar o funil.",
        impact: "Muito Alto",
        actionLabel: "Ir para Clientes/CRM",
        view: "clientes"
      };
    }
    return {
      title: "Tracionar as 5 primeiras vendas do catálogo",
      description: "Você possui clientes cadastrados no funil. Concentre as energias operacionais em converter essas oportunidades ativas para gerar o primeiro faturamento da empresa.",
      impact: "Muito Alto",
      actionLabel: "Ver Funil de Vendas",
      view: "clientes"
    };
  }

  if (currentStage === 'Financeiro') {
    const totalFinance = finance.length;
    if (totalFinance === 0) {
      return {
        title: "Estruturar o fluxo de caixa inicial da empresa",
        description: "A empresa possui tração comercial, mas o fluxo de caixa está vazio. Registre as entradas de vendas e as despesas operacionais para analisar seu ponto de equilíbrio.",
        impact: "Muito Alto",
        actionLabel: "Lançar Transações",
        view: "financeiro"
      };
    }
    const revenue = finance.filter(f => f.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const expenses = finance.filter(f => f.type === 'DESPESA' || f.type === 'SAIDA').reduce((sum, e) => sum + Number(e.amount || 0), 0);
    if (expenses > revenue) {
      return {
        title: "Otimizar custos e atingir o ponto de equilíbrio (Breakeven)",
        description: `Seus registros mostram R$ ${(expenses/100).toFixed(2)} em despesas contra R$ ${(revenue/100).toFixed(2)} em receitas. Identifique gargalos e priorize margens saudáveis.`,
        impact: "Alto",
        actionLabel: "Análise Financeira",
        view: "financeiro"
      };
    }
    return {
      title: "Configurar previsões e metas de margem líquida",
      description: "Com receitas e despesas equilibradas, estabeleça metas claras de provisionamento e caixa reserva para garantir o runway operacional dos próximos meses.",
      impact: "Médio",
      actionLabel: "Fluxo de Caixa",
      view: "financeiro"
    };
  }

  if (currentStage === 'Crescimento') {
    return {
      title: "Escalar canais de marketing e analisar retorno de investimento",
      description: "Seu caixa está saudável e sua oferta validada. Mapeie KPIs comerciais detalhados na IA e busque expansão em canais pagos ou estratégias orgânicas de escala.",
      impact: "Alto",
      actionLabel: "Análise de Métricas IA",
      view: "ia"
    };
  }

  if (currentStage === 'Gestão') {
    return {
      title: "Padronizar processos operacionais e playbooks",
      description: "Seu negócio atingiu maturidade operacional. Agora, a prioridade máxima é a descentralização: documente playbooks, treine sua equipe e crie regras claras de governança.",
      impact: "Alto",
      actionLabel: "Registrar Playbooks",
      view: "documentacao"
    };
  }

  // Fallback default strategic priority
  return {
    title: "Mapear o próximo grande marco de crescimento",
    description: "Seu workspace está ativo e saudável. Use o Planejamento Estratégico para definir o próximo estágio de evolução e documentar suas próximas metas comerciais.",
    impact: "Médio",
    actionLabel: "Planejamento Estratégico",
    view: "roadmap"
  };
}
