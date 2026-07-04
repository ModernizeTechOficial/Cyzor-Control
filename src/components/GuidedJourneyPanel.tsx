import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { View } from '../types';
import { 
  Sparkles, ChevronRight, CheckCircle2, GitBranch, 
  Layers, Users, DollarSign, TrendingUp, HelpCircle,
  Play, Settings, ArrowRight, Lightbulb, ClipboardList,
  CheckSquare, Square, Edit3, Save, Plus, AlertTriangle, 
  Check, Info, RotateCw, ChevronDown, ListTodo, Briefcase, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showSuccess, showError } from '../lib/alerts';
import ReactMarkdown from 'react-markdown';

interface GuidedJourneyPanelProps {
  setCurrentView: (view: View) => void;
  metrics: any;
  projects: any[];
  products: any[];
  ideas: any[];
  clients: any[];
  finance: any[];
  tasks: any[];
  onRefreshData: () => void;
}

const STAGES = [
  { id: 'Ideia', label: 'Ideia', description: 'Estruturação da ideia de negócio e modelagem conceitual inicial.', progress: 10, next: 'Validação' },
  { id: 'Validação', label: 'Validação', description: 'Pesquisa com clientes ideais e validação empírica do problema.', progress: 20, next: 'Projeto' },
  { id: 'Projeto', label: 'Projeto', description: 'Desenho de escopo, especificação e estruturação do cronograma do MVP.', progress: 30, next: 'Planejamento' },
  { id: 'Planejamento', label: 'Planejamento', description: 'Criação do backlog detalhado, estimativas de esforço e formação de sprints.', progress: 40, next: 'Desenvolvimento' },
  { id: 'Desenvolvimento', label: 'Desenvolvimento', description: 'Construção focada das primeiras funcionalidades funcionais do produto.', progress: 50, next: 'Produto' },
  { id: 'Produto', label: 'Produto', description: 'Definição de modelo comercial, catálogo de produtos e precificação ativa.', progress: 60, next: 'Clientes' },
  { id: 'Clientes', label: 'Clientes', description: 'Prospecção, atração de leads e conversão dos primeiros clientes pagantes.', progress: 70, next: 'Financeiro' },
  { id: 'Financeiro', label: 'Financeiro', description: 'Monitoramento detalhado do fluxo de caixa, ponto de equilíbrio e faturamento.', progress: 80, next: 'Crescimento' },
  { id: 'Crescimento', label: 'Crescimento', description: 'Otimização de canais de marketing e vendas focando em escala e canais de ROI.', progress: 90, next: 'Gestão' },
  { id: 'Gestão', label: 'Gestão', description: 'Mapeamento de processos, documentação e excelência gerencial em equipe.', progress: 100, next: 'Concluído!' }
];

const DEFAULT_MISSIONS: Record<string, { title: string; objective: string; checklist: string[]; impact: string; view: View }> = {
  Ideia: {
    title: "Estruturar o conceito do negócio e validar a dor inicial",
    objective: "Garantir que a ideia de negócio resolve um problema real de um público pagante estruturando a proposta de valor.",
    checklist: [
      "Mapear pelo menos 1 ideia no Banco de Ideias",
      "Definir a persona e o público-alvo inicial usando a IA",
      "Escrever o primeiro documento de conceito inicial"
    ],
    impact: "Evita desperdício de tempo e recursos em soluções sem demanda.",
    view: "ideias"
  },
  'Validação': {
    title: "Realizar entrevistas de validação com 5 potenciais clientes",
    objective: "Coletar feedbacks qualitativos reais sobre a dor mapeada e validar a proposta de valor sugerida.",
    checklist: [
      "Cadastrar perfil do cliente ideal",
      "Mapear as principais perguntas do roteiro de validação",
      "Registrar insights de entrevistas na IA"
    ],
    impact: "Garante o Product-Market Fit inicial da solução desenvolvida.",
    view: "ideias"
  },
  'Projeto': {
    title: "Definir o escopo, cronograma e metas de entrega do MVP",
    objective: "Transformar as hipóteses validadas em um plano de projeto factível no sistema.",
    checklist: [
      "Criar o projeto de execução do MVP no Workspace",
      "Definir metas (milestones) fundamentais de desenvolvimento",
      "Atribuir responsabilidades de equipe preliminares"
    ],
    impact: "Garante clareza e previsibilidade sobre o escopo que será construído.",
    view: "projetos"
  },
  'Planejamento': {
    title: "Mapear o Product Roadmap e estruturar o backlog de sprints",
    objective: "Garantir que as entregas do produto sejam feitas de forma incremental e ágil.",
    checklist: [
      "Montar a primeira sprint ou ciclo de trabalho",
      "Criar e detalhar pelo menos 5 tarefas táticas",
      "Configurar prioridade e prazos nas tarefas do backlog"
    ],
    impact: "Otimiza a velocidade de execução técnica e reduz retrabalho.",
    view: "projetos"
  },
  'Desenvolvimento': {
    title: "Construir e testar o núcleo das funcionalidades do MVP",
    objective: "Colocar a primeira versão funcional do produto operacional e testada de pé.",
    checklist: [
      "Completar 50% das tarefas do projeto principal",
      "Entregar o primeiro marco técnico funcional",
      "Documentar a arquitetura e fluxos operacionais"
    ],
    impact: "Gera a primeira entrega tangível pronta para teste de mercado.",
    view: "projetos"
  },
  'Produto': {
    title: "Cadastrar produtos comerciais e estruturar precificação",
    objective: "Consolidar a estrutura comercial de oferta ativa, canais e modelos de cobrança.",
    checklist: [
      "Cadastrar o primeiro Produto comercial no catálogo do Workspace",
      "Definir pricing model e canais de distribuição",
      "Mapear os diferenciais competitivos na IA"
    ],
    impact: "Habilita a operação de faturamento e de vendas profissionais.",
    view: "produtos"
  },
  'Clientes': {
    title: "Conquistar as 5 primeiras vendas ou clientes ativos",
    objective: "Garantir tração comercial inicial com clientes pagantes.",
    checklist: [
      "Cadastrar leads ou os primeiros Clientes no CRM do sistema",
      "Realizar prospecções ativas documentadas",
      "Atender e colher feedbacks de onboarding dos primeiros usuários"
    ],
    impact: "Valida financeiramente o produto e estabelece canal de receita.",
    view: "clientes"
  },
  'Financeiro': {
    title: "Estruturar o fluxo de caixa, receitas e controle de custos",
    objective: "Controlar minuciosamente a saúde financeira e estipular o runway da empresa.",
    checklist: [
      "Registrar as primeiras transações reais de receita/despesa",
      "Definir centro de custo ou categorias financeiras",
      "Analisar ponto de equilíbrio mensal (breakeven)"
    ],
    impact: "Garante estabilidade gerencial e saúde de caixa da empresa.",
    view: "financeiro"
  },
  'Crescimento': {
    title: "Analisar KPIs de conversão e escalar funil de vendas",
    objective: "Garantir tração escalável e reprodutível focando nos melhores canais de aquisição.",
    checklist: [
      "Definir e acompanhar os principais indicadores de tração (KPIs)",
      "Rodar experimento de tráfego ou canais de crescimento",
      "Configurar metas de retenção e churn rate do produto"
    ],
    impact: "Desbloqueia crescimento sustentável e escala comercial.",
    view: "ia"
  },
  'Gestão': {
    title: "Sistematizar processos-chave e rotinas operacionais",
    objective: "Consolidar processos documentados e descentralizar as atividades do negócio.",
    checklist: [
      "Mapear fluxogramas e playbooks internos no Banco de Conhecimento",
      "Delegar papéis definitivos e responsabilidades da equipe",
      "Fazer análise geral do ciclo e planejar próxima grande iniciativa"
    ],
    impact: "Fornece independência operacional e alta governança empresarial.",
    view: "dashboard"
  }
};

export default function GuidedJourneyPanel({ 
  setCurrentView, 
  metrics, 
  projects, 
  products, 
  ideas, 
  clients, 
  finance, 
  tasks, 
  onRefreshData 
}: GuidedJourneyPanelProps) {
  const { activeWorkspace, fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'journey' | 'initiatives' | 'ai'>('journey');
  const [showStageSelector, setShowStageSelector] = useState(false);
  const [editingMissionKey, setEditingMissionKey] = useState<string | null>(null);
  const [tempMissionText, setTempMissionText] = useState("");
  
  // AI States
  const [aiSubTab, setAiSubTab] = useState<'strategic' | 'operational'>('strategic');
  const [selectedOperationalInitiativeKey, setSelectedOperationalInitiativeKey] = useState("");
  const [strategicAdvice, setStrategicAdvice] = useState<string>("");
  const [operationalAdvice, setOperationalAdvice] = useState<string>("");
  const [loadingStrategic, setLoadingStrategic] = useState(false);
  const [loadingOperational, setLoadingOperational] = useState(false);

  // Active stage details
  const currentStage = useMemo(() => {
    return activeWorkspace?.settings?.stage || 'Ideia';
  }, [activeWorkspace]);

  const currentStageData = useMemo(() => {
    return STAGES.find(s => s.id === currentStage) || STAGES[0];
  }, [currentStage]);

  // Unified Initiatives List
  const unifiedInitiatives = useMemo(() => {
    const list: any[] = [];
    
    ideas.forEach(i => {
      list.push({
        id: i.id,
        key: `idea-${i.id}`,
        type: 'idea',
        typeLabel: 'Ideia',
        name: i.title,
        description: i.description || 'Sem descrição',
        status: i.status || 'Nova',
        progress: i.status === 'Convertida' || i.status === 'Aprovada' ? 100 : i.status === 'Em Análise' ? 50 : 25,
        owner: 'Autor da Ideia',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold py-1 px-2.5 rounded-full inline-flex items-center gap-1'
      });
    });

    projects.forEach(p => {
      list.push({
        id: p.id,
        key: `project-${p.id}`,
        type: 'project',
        typeLabel: 'Projeto',
        name: p.name,
        description: p.description || 'Sem descrição',
        status: p.status || 'Em Andamento',
        progress: p.progress || 0,
        owner: p.owner || 'Sem dono',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold py-1 px-2.5 rounded-full inline-flex items-center gap-1'
      });
    });

    products.forEach(pr => {
      list.push({
        id: pr.id,
        key: `product-${pr.id}`,
        type: 'product',
        typeLabel: 'Produto',
        name: pr.name,
        description: pr.description || 'Sem descrição',
        status: pr.status || 'Ativo',
        progress: pr.status === 'Lançado' || pr.status === 'Ativo' ? 100 : 50,
        owner: 'Product Manager',
        color: 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold py-1 px-2.5 rounded-full inline-flex items-center gap-1'
      });
    });

    return list;
  }, [ideas, projects, products]);

  // Auto Select first initiative for Operational AI on load
  useEffect(() => {
    if (unifiedInitiatives.length > 0 && !selectedOperationalInitiativeKey) {
      setSelectedOperationalInitiativeKey(unifiedInitiatives[0].key);
    }
  }, [unifiedInitiatives, selectedOperationalInitiativeKey]);

  // Initiative Indicators (KPIs)
  const initiativeIndicators = useMemo(() => {
    const ideasInProgress = ideas.filter(i => i.status !== 'Rejeitada' && i.status !== 'Convertida').length;
    const activeProjects = projects.filter(p => p.status === 'Em Andamento' || p.status === 'Planejamento').length;
    const publishedProducts = products.filter(p => p.status === 'Ativo' || p.status === 'Lançado').length;
    
    const today = new Date();
    const delayedProjects = projects.filter(p => {
      if (p.status === 'Concluído') return false;
      if (!p.dueDate) return false;
      return new Date(p.dueDate) < today;
    }).length;

    const upcomingProjects = projects
      .filter(p => p.status !== 'Concluído' && p.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    let nextMilestone = 'Sem prazos próximos';
    if (upcomingProjects.length > 0) {
      const nextProj = upcomingProjects[0];
      const daysLeft = Math.ceil((new Date(nextProj.dueDate).getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysLeft < 0) {
        nextMilestone = `${nextProj.name} (Atrasado)`;
      } else if (daysLeft === 0) {
        nextMilestone = `${nextProj.name} (Vence Hoje)`;
      } else {
        nextMilestone = `${nextProj.name} em ${daysLeft} dia(s)`;
      }
    }

    return {
      ideasInProgress,
      activeProjects,
      publishedProducts,
      delayedProjects,
      nextMilestone
    };
  }, [ideas, projects, products]);

  // Automatic journey recommendation
  const autoSuggestion = useMemo(() => {
    if (currentStage === 'Ideia' && ideas.length > 0) {
      return {
        message: "Detectamos que você já possui ideias estruturadas! Pronto para avançar para a fase de Validação?",
        targetStage: "Validação"
      };
    }
    if (currentStage === 'Validação' && projects.length > 0) {
      return {
        message: "Encontramos projetos criados! É ideal atualizar o estágio para o nível de Projeto.",
        targetStage: "Projeto"
      };
    }
    if (currentStage === 'Projeto' && tasks.length > 0) {
      return {
        message: "Você já possui tarefas cadastradas no backlog. Avance para a fase de Planejamento.",
        targetStage: "Planejamento"
      };
    }
    if (currentStage === 'Planejamento' && projects.some(p => p.status === 'Em Andamento')) {
      return {
        message: "Seus projetos estão em andamento operacional. Evolua para Desenvolvimento!",
        targetStage: "Desenvolvimento"
      };
    }
    if (currentStage === 'Desenvolvimento' && products.length > 0) {
      return {
        message: "Você já cadastrou seu primeiro produto comercial. Avance para a etapa de Produto!",
        targetStage: "Produto"
      };
    }
    if (currentStage === 'Produto' && clients.length > 0) {
      return {
        message: "Detectamos clientes ativos cadastrados. Evolua para a etapa de Clientes!",
        targetStage: "Clientes"
      };
    }
    if (currentStage === 'Clientes' && finance.length > 0) {
      return {
        message: "Movimentações financeiras identificadas. Avance para o controle Financeiro estruturado!",
        targetStage: "Financeiro"
      };
    }
    if (currentStage === 'Financeiro' && finance.some(f => f.type === 'RECEITA')) {
      return {
        message: "Receitas detectadas no fluxo! É hora de focar em tração na etapa de Crescimento.",
        targetStage: "Crescimento"
      };
    }
    return null;
  }, [currentStage, ideas, projects, products, clients, finance, tasks]);

  // Stage Checklist
  const activeMission = useMemo(() => {
    return DEFAULT_MISSIONS[currentStage] || DEFAULT_MISSIONS['Ideia'];
  }, [currentStage]);

  const activeChecklist = useMemo(() => {
    const saved = activeWorkspace?.settings?.strategicMissionChecklist?.[currentStage];
    if (saved && Array.isArray(saved)) return saved;
    return activeMission.checklist.map(text => ({ text, done: false }));
  }, [currentStage, activeWorkspace, activeMission]);

  const checklistProgress = useMemo(() => {
    if (activeChecklist.length === 0) return 0;
    const completed = activeChecklist.filter(item => item.done).length;
    return Math.round((completed / activeChecklist.length) * 100);
  }, [activeChecklist]);

  // Actions
  const handleStageChange = async (stageId: string) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetchWithAuth(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            stage: stageId
          }
        })
      });
      if (res.ok) {
        showSuccess(`Estágio alterado para: ${stageId}`);
        setShowStageSelector(false);
        onRefreshData();
      } else {
        showError("Falha ao atualizar o estágio.");
      }
    } catch (err) {
      console.error(err);
      showError("Erro de conexão.");
    }
  };

  const toggleChecklistItem = async (index: number) => {
    if (!activeWorkspace) return;
    const updatedChecklist = [...activeChecklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      done: !updatedChecklist[index].done
    };

    const allChecklists = {
      ...(activeWorkspace.settings?.strategicMissionChecklist || {}),
      [currentStage]: updatedChecklist
    };

    try {
      const res = await fetchWithAuth(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            strategicMissionChecklist: allChecklists
          }
        })
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInitiativeMission = async (key: string) => {
    if (!activeWorkspace) return;
    const existingMissions = activeWorkspace.settings?.initiativeMissions || {};
    const updatedMissions = {
      ...existingMissions,
      [key]: tempMissionText
    };

    try {
      const res = await fetchWithAuth(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            initiativeMissions: updatedMissions
          }
        })
      });
      if (res.ok) {
        showSuccess("Missão operacional atualizada!");
        setEditingMissionKey(null);
        onRefreshData();
      } else {
        showError("Falha ao salvar missão.");
      }
    } catch (err) {
      console.error(err);
      showError("Erro de rede.");
    }
  };

  const startEditMission = (key: string, currentText: string) => {
    setEditingMissionKey(key);
    setTempMissionText(currentText);
  };

  // AI Requests
  const requestStrategicConsultancy = async () => {
    if (loadingStrategic) return;
    setLoadingStrategic(true);
    setStrategicAdvice("");

    const prompt = `Olá! Sou o consultor de negócios da Cyzor Control. 
Nosso Workspace se chama "${activeWorkspace?.name || 'Cyzor Corporation'}". 
Atualmente, nossa empresa está estruturada no seguinte nível de maturidade da jornada corporativa: "${currentStage}". 
Aqui estão os nossos indicadores agregados e métricas reais do Workspace:
- Banco de Ideias: ${ideas.length} ideias ativas.
- Projetos / Atividades: ${projects.length} cadastrados (${projects.filter(p => p.status === 'Em Andamento').length} em andamento).
- Catálogo de Produtos: ${products.length} cadastrados.
- CRM de Clientes: ${clients.length} clientes.
- Financeiro: R$ ${(metrics?.revenue || 0).toFixed(2)}k em receita faturada e ${finance.length} transações.

Por favor, faça uma análise estratégica extremamente detalhada baseada no nosso nível atual de maturidade "${currentStage}" e sugira:
1. Uma análise objetiva do nosso estágio e consistência com nossos números.
2. Os 3 próximos passos mais cruciais para continuar a nossa evolução.
3. Principais riscos operacionais identificados que podem frear nosso crescimento.
4. Oportunidades de escala e otimização comercial baseadas no nosso escopo.`;

    try {
      const response = await fetchWithAuth('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (response.ok) {
        const data = await response.json();
        setStrategicAdvice(data.text);
      } else {
        setStrategicAdvice("Falha ao obter consultoria estratégica da IA. Verifique sua conexão ou tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setStrategicAdvice("Erro de conexão ao contatar a Cyzor IA.");
    } finally {
      setLoadingStrategic(false);
    }
  };

  const requestOperationalConsultancy = async () => {
    if (loadingOperational || !selectedOperationalInitiativeKey) return;
    setLoadingOperational(true);
    setOperationalAdvice("");

    const selectedInitiative = unifiedInitiatives.find(i => i.key === selectedOperationalInitiativeKey);
    if (!selectedInitiative) {
      setOperationalAdvice("Nenhuma iniciativa selecionada.");
      setLoadingOperational(false);
      return;
    }

    const initiativeMission = activeWorkspace?.settings?.initiativeMissions?.[selectedInitiative.key] || "";

    const prompt = `Olá! Sou o consultor de operações da Cyzor Control. 
Gostaria de uma consultoria técnica e tática extremamente focada na iniciativa "${selectedInitiative.name}".
Detalhes da Iniciativa:
- Tipo: ${selectedInitiative.typeLabel}
- Status Atual: ${selectedInitiative.status}
- Descrição: ${selectedInitiative.description}
- Missão Operacional Atribuída pelo Usuário: "${initiativeMission || 'Nenhuma missão definida ainda'}"

Por favor, analise as especificidades dessa iniciativa operacional isolada e sugira:
1. Lista de tarefas táticas detalhadas para colocar em prática imediatamente.
2. Sugestão de escopo refinado (MVP ou melhorias) e metas claras (Marcos de entrega).
3. Estruturação sugerida de documentação de apoio ou pesquisas necessárias.
4. Métodos práticos para engajar e organizar a equipe em volta desse escopo.`;

    try {
      const response = await fetchWithAuth('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (response.ok) {
        const data = await response.json();
        setOperationalAdvice(data.text);
      } else {
        setOperationalAdvice("Falha ao obter consultoria operacional da IA. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setOperationalAdvice("Erro ao contatar a Cyzor IA.");
    } finally {
      setLoadingOperational(false);
    }
  };

  // Progressive Disclosure Recommendations based on active stage
  const progressiveDisclosureText = useMemo(() => {
    if (currentStage === 'Ideia' || currentStage === 'Validação') {
      return {
        title: "💡 Foco no Estágio de Descoberta",
        desc: "Nas fases iniciais de ideias e validação, o mais importante é documentar premissas e obter feedbacks. Priorize o Banco de Ideias, gere hipóteses com a Consultora Estratégica, e use a Documentação de pesquisas. Os módulos de equipe avançada, faturamento, e cronogramas detalhados estarão destacados quando você avançar na jornada de evolução empresarial.",
        links: [
          { label: "Ir para Banco de Ideias", view: "ideias" as View }
        ]
      };
    }
    if (currentStage === 'Projeto' || currentStage === 'Planejamento' || currentStage === 'Desenvolvimento') {
      return {
        title: "⚙️ Foco em Construção e Gestão de Fluxo",
        desc: "Agora que a dor está validada, você precisa de execução ágil. Priorize a criação de Projetos no Workspace, gerencie o backlog de tarefas no quadro Kanban, organize o Roadmap em sprints, e engaje a sua Equipe. Mapeie milestones operacionais com a IA e mantenha o ritmo semanal.",
        links: [
          { label: "Ir para Gestão de Projetos", view: "projetos" as View }
        ]
      };
    }
    return {
      title: "📈 Foco Comercial, Financeiro e Escala",
      desc: "Excelente! Sua empresa está estruturada tecnicamente. O foco agora é aquisição de mercado e sustentabilidade. Priorize cadastrar e precificar Produtos comerciais, manter o CRM de Clientes sempre atualizado para tracionar vendas, alimentar o módulo Financeiro de fluxo de caixa, e monitorar KPIs de crescimento.",
      links: [
        { label: "Ir para Clientes/CRM", view: "clientes" as View },
        { label: "Ir para Gestão Financeira", view: "financeiro" as View }
      ]
    };
  }, [currentStage]);

  return (
    <div className="w-full bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col overflow-hidden">
      {/* Header Tabs */}
      <div className="border-b border-[#0F172A05] bg-slate-50/50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50/60 border border-[#0F172A05] flex items-center justify-center text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#111111] tracking-tight">Business Journey Engine</h2>
            <p className="text-[11px] text-[#64748B] font-medium">Maturidade corporativa e controle unificado de iniciativas operacionais</p>
          </div>
        </div>

        <div className="flex bg-slate-100/60 border border-[#0F172A03] p-1 rounded-xl items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('journey')}
            className={`px-3.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === 'journey'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#64748B] hover:text-[#111111]'
            }`}
          >
            🗺️ Jornada & Missão
          </button>
          <button
            onClick={() => setActiveTab('initiatives')}
            className={`px-3.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === 'initiatives'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#64748B] hover:text-[#111111]'
            }`}
          >
            🚀 Iniciativas ({unifiedInitiatives.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === 'ai'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#64748B] hover:text-[#111111]'
            }`}
          >
            🧠 Consultoria IA
          </button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: JOURNEY & STRATEGIC MISSION */}
          {activeTab === 'journey' && (
            <motion.div
              key="tab-journey"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Timeline Track */}
              <div className="bg-slate-50/50 rounded-[20px] border border-[#0F172A05] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50/60 border border-blue-100/30 py-1 px-2.5 rounded-full uppercase">
                      Maturidade da Empresa
                    </span>
                    <h3 className="text-base font-bold text-[#111111] tracking-tight mt-2 flex items-center gap-2">
                      Estágio Atual: {currentStage}
                      <span className="text-xs font-medium text-[#64748B]">({currentStageData.progress}% de Evolução)</span>
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 font-medium">{currentStageData.description}</p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowStageSelector(!showStageSelector)}
                      className="flex items-center gap-1.5 bg-white border border-[#0F172A08] px-3 py-1.5 rounded-xl text-xs font-bold text-[#334155] hover:bg-slate-50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                      Alterar Estágio
                      <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                    </button>

                    {showStageSelector && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-[#0F172A08] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] z-20 overflow-hidden py-1 divide-y divide-[#0F172A03] max-h-72 overflow-y-auto">
                        {STAGES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleStageChange(s.id)}
                            className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                              currentStage === s.id 
                                ? 'bg-blue-50/50 text-blue-600 font-bold' 
                                : 'text-[#64748B] hover:bg-slate-50 hover:text-[#111111]'
                            }`}
                          >
                            <span>{s.id} ({s.progress}%)</span>
                            {currentStage === s.id && <Check className="w-3 h-3 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal steps flow */}
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 pt-2">
                  {STAGES.map((s, index) => {
                    const isPassed = STAGES.findIndex(x => x.id === currentStage) >= index;
                    const isCurrent = s.id === currentStage;
                    return (
                      <div
                        key={s.id}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isCurrent 
                            ? 'bg-[#111111] border-[#111111] text-white shadow-sm ring-2 ring-slate-100 scale-102 font-bold' 
                            : isPassed
                            ? 'bg-blue-50/50 border-blue-100/30 text-blue-600 font-bold'
                            : 'bg-white border-[#0F172A05] text-[#94A3B8] hover:border-[#0F172A08]'
                        }`}
                      >
                        <div className="text-[10px] font-black block">{index + 1}</div>
                        <div className="text-[11px] truncate font-extrabold mt-0.5">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${currentStageData.progress}%` }}
                  />
                </div>
              </div>

              {/* Automatic Suggestion banner */}
              {autoSuggestion && (
                <div className="bg-amber-50/60 border border-amber-100/50 rounded-[20px] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-pulse">
                  <div className="flex gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-900">Sugestão de Evolução Inteligente</h4>
                      <p className="text-xs text-amber-800 mt-0.5 font-medium">{autoSuggestion.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStageChange(autoSuggestion.targetStage)}
                    className="bg-amber-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    Avançar para {autoSuggestion.targetStage}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Strategic Mission Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-[#0F172A08] rounded-[24px] p-6 space-y-6 flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Missão Estratégica Ativa
                        </span>
                        <h3 className="text-lg font-bold text-[#111111] mt-2 tracking-tight">
                          {activeMission.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-blue-600">{checklistProgress}% Concluído</div>
                        <div className="w-24 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${checklistProgress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#334155] bg-[#FAFAFA] p-3.5 rounded-xl border border-[#0F172A03] space-y-1 font-medium">
                      <span className="font-bold text-[#111111]">Objetivo Principal:</span>
                      <p className="text-[#334155] leading-relaxed mt-0.5">{activeMission.objective}</p>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-xs font-bold text-[#111111] flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-blue-500" />
                        Checklist do Estágio
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {activeChecklist.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => toggleChecklistItem(index)}
                            className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${
                              item.done 
                                ? 'bg-emerald-50/20 border-emerald-100/50 text-[#64748B] line-through font-medium' 
                                : 'bg-white border-[#0F172A08] text-[#334155] hover:border-slate-200 hover:bg-[#FAFAFA] font-semibold'
                            }`}
                          >
                            {item.done ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-[#94A3B8] shrink-0" />
                            )}
                            <span className="text-xs">{item.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#0F172A03] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                      <Info className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <span className="font-bold text-[#334155]">Impacto Esperado:</span> {activeMission.impact}
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentView(activeMission.view)}
                      className="w-full sm:w-auto bg-[#111111] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 group self-end shadow-sm"
                    >
                      Continuar Jornada
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Progressive Disclosure Section */}
                <div className="lg:col-span-4 bg-slate-50/40 border border-[#0F172A05] rounded-[24px] p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      {progressiveDisclosureText.title}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                      {progressiveDisclosureText.desc}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    {progressiveDisclosureText.links.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentView(link.view)}
                        className="w-full text-left text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center justify-between p-2.5 bg-white border border-[#0F172A08] rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: INITIATIVES (RESUMO & LIST) */}
          {activeTab === 'initiatives' && (
            <motion.div
              key="tab-initiatives"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Summary Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white border border-[#0F172A08] rounded-[20px] p-4 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Ideias em Andamento</div>
                  <div className="text-xl font-black text-blue-600 mt-1">{initiativeIndicators.ideasInProgress}</div>
                </div>
                <div className="bg-white border border-[#0F172A08] rounded-[20px] p-4 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Projetos Ativos</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">{initiativeIndicators.activeProjects}</div>
                </div>
                <div className="bg-white border border-[#0F172A08] rounded-[20px] p-4 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Produtos Publicados</div>
                  <div className="text-xl font-black text-amber-600 mt-1">{initiativeIndicators.publishedProducts}</div>
                </div>
                <div className="bg-white border border-[#0F172A08] rounded-[20px] p-4 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                  <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider text-rose-500">Projetos Atrasados</div>
                  <div className="text-xl font-black text-rose-600 mt-1">{initiativeIndicators.delayedProjects}</div>
                </div>
                <div className="bg-white border border-[#0F172A08] rounded-[20px] p-4 text-center col-span-2 md:col-span-1 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-center">
                  <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Próximo Marco</div>
                  <div className="text-xs font-black text-[#111111] truncate mt-1">{initiativeIndicators.nextMilestone}</div>
                </div>
              </div>

              {/* Interactive Initiatives Table */}
              <div className="bg-white border border-[#0F172A08] rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                <div className="p-4 bg-slate-50/50 border-b border-[#0F172A05] flex justify-between items-center">
                  <h3 className="text-xs font-black text-[#64748B] uppercase tracking-wider">Acompanhamento de Iniciativas Ativas</h3>
                  <span className="text-[11px] text-blue-600 font-bold">{unifiedInitiatives.length} Iniciativas no total</span>
                </div>

                {unifiedInitiatives.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <Briefcase className="w-10 h-10 text-[#94A3B8] mx-auto" />
                    <h4 className="text-xs font-bold text-[#111111]">Nenhuma Iniciativa Cadastrada</h4>
                    <p className="text-xs text-[#64748B] font-medium">Suas ideias, projetos e produtos cadastrados aparecerão listados aqui.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50/30 text-[11px] font-bold text-[#64748B] border-b border-[#0F172A05] uppercase">
                          <th className="py-3.5 px-4 w-1/4">Iniciativa</th>
                          <th className="py-3.5 px-4 w-1/12">Tipo</th>
                          <th className="py-3.5 px-4 w-1/12">Status</th>
                          <th className="py-3.5 px-4 w-1/12">Progresso</th>
                          <th className="py-3.5 px-4 w-5/12">Missão da Iniciativa (Operacional)</th>
                          <th className="py-3.5 px-4 w-1/12 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0F172A03] text-xs font-medium">
                        {unifiedInitiatives.map((init) => {
                          const customMission = activeWorkspace?.settings?.initiativeMissions?.[init.key] || "";
                          const isEditing = editingMissionKey === init.key;

                          return (
                            <tr key={init.key} className="hover:bg-slate-50/35 transition-colors">
                              <td className="py-4 px-4 font-bold text-[#111111]">
                                <div className="truncate max-w-xs">{init.name}</div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={init.color}>{init.typeLabel}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-[#64748B] font-semibold">{init.status}</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full" style={{ width: `${init.progress}%` }} />
                                  </div>
                                  <span className="font-black text-[#111111]">{init.progress}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={tempMissionText}
                                      onChange={(e) => setTempMissionText(e.target.value)}
                                      placeholder="Ex: Criar fluxo de pagamento"
                                      className="border border-[#0F172A08] rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500 w-full bg-white text-[#111111]"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleUpdateInitiativeMission(init.key)}
                                      className="p-1.5 bg-[#111111] hover:bg-blue-600 text-white rounded-lg shrink-0 transition-all"
                                      title="Salvar"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingMissionKey(null)}
                                      className="p-1.5 bg-slate-100 text-[#64748B] rounded-lg hover:bg-slate-200 shrink-0 transition-all"
                                      title="Cancelar"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-[#64748B] group">
                                    <span className="truncate max-w-sm italic font-medium">
                                      {customMission || "Nenhuma missão de iniciativa configurada."}
                                    </span>
                                    <button
                                      onClick={() => startEditMission(init.key, customMission)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-blue-600 rounded transition-opacity"
                                      title="Editar Missão"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => {
                                    if (init.type === 'idea') setCurrentView('ideias');
                                    if (init.type === 'project') setCurrentView('projetos');
                                    if (init.type === 'product') setCurrentView('produtos');
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-extrabold"
                                >
                                  Acessar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI CONSULTANCY (STRATEGIC & OPERATIONAL) */}
          {activeTab === 'ai' && (
            <motion.div
              key="tab-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Sub tabs selector */}
              <div className="flex border-b border-[#0F172A05] gap-6">
                <button
                  onClick={() => setAiSubTab('strategic')}
                  className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
                    aiSubTab === 'strategic'
                      ? 'border-blue-600 text-blue-600 font-black'
                      : 'border-transparent text-[#64748B] hover:text-[#111111]'
                  }`}
                >
                  🏢 Consultora Estratégica (Empresa)
                </button>
                <button
                  onClick={() => setAiSubTab('operational')}
                  className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
                    aiSubTab === 'operational'
                      ? 'border-blue-600 text-blue-600 font-black'
                      : 'border-transparent text-[#64748B] hover:text-[#111111]'
                  }`}
                >
                  ⚙️ Consultora Operacional (Iniciativas)
                </button>
              </div>

              {/* Strategic Advice */}
              {aiSubTab === 'strategic' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4 bg-slate-50/50 rounded-[20px] border border-[#0F172A05] p-5 space-y-4 self-start">
                    <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Análise Geral da Empresa
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                      A Consultora Estratégica analisa a saúde e a maturidade da sua empresa inteira, ponderando o estágio da sua jornada ({currentStage}) e suas iniciativas ativas.
                    </p>

                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex justify-between p-2 bg-white rounded-lg border border-[#0F172A05]">
                        <span className="text-[#64748B] font-medium">Maturidade:</span>
                        <span className="font-bold text-blue-600">{currentStage}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded-lg border border-[#0F172A05]">
                        <span className="text-[#64748B] font-medium">Iniciativas:</span>
                        <span className="font-bold text-[#111111]">{unifiedInitiatives.length}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white rounded-lg border border-[#0F172A05]">
                        <span className="text-[#64748B] font-medium">Clientes Ativos:</span>
                        <span className="font-bold text-[#111111]">{clients.length}</span>
                      </div>
                    </div>

                    <button
                      onClick={requestStrategicConsultancy}
                      disabled={loadingStrategic}
                      className="w-full bg-[#111111] hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {loadingStrategic ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Analisando Empresa...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Obter Análise Estratégica
                        </>
                      )}
                    </button>
                  </div>

                  <div className="lg:col-span-8 bg-white border border-[#0F172A08] rounded-[24px] p-6 min-h-[250px] flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    {loadingStrategic ? (
                      <div className="flex flex-col items-center justify-center h-full py-16 space-y-3">
                        <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold text-[#334155]">A IA está mapeando o seu negócio...</span>
                        <p className="text-[11px] text-[#64748B] font-medium">Analisando faturamento, equipe, ideias e cronogramas operacionais.</p>
                      </div>
                    ) : strategicAdvice ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#0F172A03] pb-3">
                          <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Parecer Estratégico da IA</h4>
                          <button 
                            onClick={requestStrategicConsultancy}
                            className="text-xs text-[#64748B] hover:text-blue-600 flex items-center gap-1 font-bold"
                          >
                            <RotateCw className="w-3 h-3" />
                            Recalcular
                          </button>
                        </div>
                        <div className="markdown-body text-xs text-[#334155] leading-relaxed max-h-[400px] overflow-y-auto space-y-2 pr-2 font-medium">
                          <ReactMarkdown>{strategicAdvice}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-16 space-y-3 text-center">
                        <Lightbulb className="w-12 h-12 text-blue-200" />
                        <h4 className="text-xs font-bold text-[#111111]">Pronto para Diagnóstico</h4>
                        <p className="text-xs text-[#64748B] max-w-sm font-medium">Clique no botão à esquerda para solicitar uma análise estratégica baseada em dados reais da empresa.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Operational Advice */}
              {aiSubTab === 'operational' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4 bg-slate-50/50 rounded-[20px] border border-[#0F172A05] p-5 space-y-4 self-start">
                    <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Análise de Iniciativa
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                      Selecione uma iniciativa (ideia, projeto ou produto) para receber um planilhado tático de tarefas operacionais e documentação.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#64748B] uppercase">Selecione a Iniciativa</label>
                      <select
                        value={selectedOperationalInitiativeKey}
                        onChange={(e) => setSelectedOperationalInitiativeKey(e.target.value)}
                        className="w-full border border-[#0F172A08] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white text-[#111111]"
                      >
                        {unifiedInitiatives.map((init) => (
                          <option key={init.key} value={init.key}>
                            [{init.typeLabel}] {init.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={requestOperationalConsultancy}
                      disabled={loadingOperational || !selectedOperationalInitiativeKey}
                      className="w-full bg-[#111111] hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {loadingOperational ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Calculando Táticas...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Obter Parecer Operacional
                        </>
                      )}
                    </button>
                  </div>

                  <div className="lg:col-span-8 bg-white border border-[#0F172A08] rounded-[24px] p-6 min-h-[250px] flex flex-col justify-between shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                    {loadingOperational ? (
                      <div className="flex flex-col items-center justify-center h-full py-16 space-y-3">
                        <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="text-xs font-bold text-[#334155]">Mapeando cronograma operacional...</span>
                        <p className="text-[11px] text-[#64748B] font-medium">Modelando tarefas prioritárias, documentações de suporte e escopo.</p>
                      </div>
                    ) : operationalAdvice ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#0F172A03] pb-3">
                          <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Diretrizes de Execução da IA</h4>
                          <button 
                            onClick={requestOperationalConsultancy}
                            className="text-xs text-[#64748B] hover:text-blue-600 flex items-center gap-1 font-bold"
                          >
                            <RotateCw className="w-3 h-3" />
                            Recalcular
                          </button>
                        </div>
                        <div className="markdown-body text-xs text-[#334155] leading-relaxed max-h-[400px] overflow-y-auto space-y-2 pr-2 font-medium">
                          <ReactMarkdown>{operationalAdvice}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-16 space-y-3 text-center">
                        <Lightbulb className="w-12 h-12 text-blue-200" />
                        <h4 className="text-xs font-bold text-[#111111]">Planejamento Tático Prontinho</h4>
                        <p className="text-xs text-[#64748B] max-w-sm font-medium">Selecione uma iniciativa operacional no menu ao lado e clique em solicitar parecer.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
