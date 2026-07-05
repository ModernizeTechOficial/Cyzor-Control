import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  useIdeas, useProjects, useProducts, useTasks, useFinance 
} from '../hooks/useCyzorQueries';
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
import { calculateStrategicPriority } from '../utils/strategicPrioritizer';

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
      "Definir e acompanhá os principais indicadores de tração (KPIs)",
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

export default function PlanejamentoEstrategicoView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth, syncSaaSState } = useAuth();
  const { setGlobalFilters } = useNavigation();

  // Queries using React Query
  const { data: ideas = [], refetch: refetchIdeas } = useIdeas();
  const { data: projects = [], refetch: refetchProjects } = useProjects();
  const { data: products = [], refetch: refetchProducts } = useProducts();
  const { data: tasks = [], refetch: refetchTasks } = useTasks();
  const { data: finance = [], refetch: refetchFinance } = useFinance();

  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const fetchClients = async () => {
    if (!activeWorkspace) return;
    setLoadingClients(true);
    try {
      const res = await fetchWithAuth('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [activeWorkspace]);

  const refetchAll = () => {
    refetchIdeas();
    refetchProjects();
    refetchProducts();
    refetchTasks();
    refetchFinance();
    fetchClients();
  };

  // State managers
  const [showStageSelector, setShowStageSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'journey' | 'initiatives' | 'ai'>('journey');
  const [aiSubTab, setAiSubTab] = useState<'strategic' | 'operational'>('strategic');
  const [selectedOperationalInitiativeKey, setSelectedOperationalInitiativeKey] = useState("");
  const [strategicAdvice, setStrategicAdvice] = useState<string>("");
  const [operationalAdvice, setOperationalAdvice] = useState<string>("");
  const [loadingStrategic, setLoadingStrategic] = useState(false);
  const [loadingOperational, setLoadingOperational] = useState(false);
  const [editingMissionKey, setEditingMissionKey] = useState<string | null>(null);
  const [tempMissionText, setTempMissionText] = useState("");

  const currentStage = useMemo(() => {
    return activeWorkspace?.settings?.stage || 'Ideia';
  }, [activeWorkspace]);

  const currentStageData = useMemo(() => {
    return STAGES.find(s => s.id === currentStage) || STAGES[0];
  }, [currentStage]);

  // Unified Initiatives
  const unifiedInitiatives = useMemo(() => {
    const list: any[] = [];
    
    ideas.forEach((i: any) => {
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

    projects.forEach((p: any) => {
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

    products.forEach((pr: any) => {
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

  // Auto select initiative
  useEffect(() => {
    if (unifiedInitiatives.length > 0 && !selectedOperationalInitiativeKey) {
      setSelectedOperationalInitiativeKey(unifiedInitiatives[0].key);
    }
  }, [unifiedInitiatives, selectedOperationalInitiativeKey]);

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

  // Handlers
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
        showSuccess(`Nível de maturidade alterado para: ${stageId}`);
        setShowStageSelector(false);
        await syncSaaSState();
        refetchAll();
      } else {
        showError("Falha ao atualizar o nível de maturidade.");
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
        await syncSaaSState();
        refetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditMission = (key: string, currentText: string) => {
    setEditingMissionKey(key);
    setTempMissionText(currentText);
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
        await syncSaaSState();
        refetchAll();
      } else {
        showError("Falha ao salvar missão.");
      }
    } catch (err) {
      console.error(err);
      showError("Erro de rede.");
    }
  };

  // AI Consultancies
  const requestStrategicConsultancy = async () => {
    if (loadingStrategic) return;
    setLoadingStrategic(true);
    setStrategicAdvice("");

    const totalRevenue = finance
      .filter((f: any) => f.type === 'RECEITA')
      .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

    const prompt = `Olá! Sou o consultor executivo sênior e estrategista de negócios integrado da Cyzor Control. 
Nosso Workspace se chama "${activeWorkspace?.name || 'Cyzor Corporation'}". 
Atualmente, nossa empresa está avaliada no nível de maturidade: "${currentStage}". 
Métricas e indicadores reais que observamos no Workspace:
- Propostas e Ideias registradas: ${ideas.length} tese(s).
- Projetos estruturados: ${projects.length} ativo(s) (${projects.filter((p: any) => p.status === 'Em Andamento').length} em andamento).
- Catálogo de Ofertas/Produtos: ${products.length} cadastrados.
- CRM de Clientes e Leads: ${clients.length} contatos.
- Faturamento do caixa registrado: R$ ${(totalRevenue / 100).toFixed(2)} em receitas totais faturadas, de um total de ${finance.length} transações comerciais registradas.

Como conselheiro estratégico, elabore uma análise sumamente executiva, objetiva e sem rodeios para nosso negócio:
1. Avaliação cirúrgica da consistência de estarmos na etapa "${currentStage}" frente a estes números e iniciativas.
2. Identificação clara de gargalos ou dependências no workspace que impedem nossa evolução para a próxima etapa.
3. Recomendação tática das 3 decisões e ações práticas que mais moverão o ponteiro do negócio nos próximos 15 dias.
4. Análise de mitigação de riscos operacionais baseada na tração do nosso caixa e no envolvimento do público-alvo.`;

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
        setStrategicAdvice("Não foi possível gerar a consultoria no momento. Verifique seus limites da API ou tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setStrategicAdvice("Erro de conexão ao contatar o consultor de IA.");
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
      setOperationalAdvice("Selecione uma iniciativa válida para consultar.");
      setLoadingOperational(false);
      return;
    }

    const initiativeMission = activeWorkspace?.settings?.initiativeMissions?.[selectedInitiative.key] || "";

    const prompt = `Olá! Sou o consultor tático e operacional de projetos da Cyzor Control.
Gostaria de uma consultoria tática de alto nível focada exclusivamente na execução da nossa iniciativa de ${selectedInitiative.typeLabel} intitulada "${selectedInitiative.name}".
Detalhes da Iniciativa:
- Tipo: ${selectedInitiative.typeLabel}
- Status Atual no Workspace: ${selectedInitiative.status}
- Descrição Técnica: "${selectedInitiative.description}"
- Missão Executiva Atribuída: "${initiativeMission || 'Nenhuma missão operacional detalhada ainda'}"

Por favor, analise esses fatos operacionais e prescreva:
1. Um roteiro de 5 passos táticos práticos e imediatos para acelerar o progresso ou concluir essa iniciativa.
2. Definição clara do escopo do MVP ou refino do entregável para evitar escopo inflado.
3. Sugestão de documentação que o time precisa escrever no Banco de Conhecimento para apoiar esse entregável.
4. Como delegar e acompanhar marcos (milestones) deste item de forma transparente no time.`;

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
        setOperationalAdvice("Falha ao contatar a IA tática. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setOperationalAdvice("Erro operacional ao contatar o consultor de IA.");
    } finally {
      setLoadingOperational(false);
    }
  };

  const activeStageIndex = STAGES.findIndex(s => s.id === currentStage);

  const calculatedPriority = calculateStrategicPriority({
    currentStage,
    ideas,
    projects,
    products,
    clients,
    finance,
    tasks
  });

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 flex flex-col gap-6 sm:gap-8 lg:gap-10 animate-in fade-in duration-300 relative px-3 sm:px-6 lg:px-8">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            ESTRATÉGIA CORPORATIVA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            Planejamento Estratégico
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1">
            Mapeamento contínuo de maturidade, priorização e recomendações do consultor de IA.
          </p>
        </div>

        {/* Change Active Stage Action */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowStageSelector(!showStageSelector)}
            className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 bg-white hover:bg-slate-50 border border-[#0F172A0F] hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Nível: {currentStage}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showStageSelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-[18rem] sm:w-72 bg-white border border-[#0F172A08] rounded-2xl shadow-xl z-50 p-2 max-h-96 overflow-y-auto custom-scrollbar"
              >
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                  Selecione o nível de maturidade
                </div>
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStageChange(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex flex-col gap-1 transition-colors ${currentStage === s.id ? 'bg-[#111111] text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className="font-bold flex justify-between items-center w-full">
                      <span>{s.label}</span>
                      {currentStage === s.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <p className={`text-[10px] leading-relaxed ${currentStage === s.id ? 'text-white/75' : 'text-slate-400'}`}>
                      {s.description}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Corporate Evolution Stage Map (Durable Strategic timeline) */}
      <div className="w-full bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 space-y-6 relative z-20 overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
              Evolução da Maturidade Corporativa
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Sua empresa avança gradualmente conforme valida teses, constrói o MVP e escala vendas.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 py-1.5 px-3.5 rounded-xl">
            <span>Progresso Geral:</span>
            <span className="text-blue-600 font-extrabold">{currentStageData.progress}%</span>
          </div>
        </div>

        {/* Linear Stage timeline - premium execution */}
        <div className="relative w-full py-3 sm:py-4 overflow-x-auto overflow-y-visible custom-scrollbar">
          <div className="min-w-[720px] sm:min-w-[760px] md:min-w-0 flex items-start justify-between relative px-2 sm:px-6 md:px-10 h-16 mt-12 sm:mt-14 overflow-visible">
            
            {/* Background Line */}
            <div className="absolute left-10 right-10 sm:left-20 sm:right-20 top-[18px] h-1 bg-slate-100 rounded-full z-0" />
            
            {/* Active Progress Fill Line */}
            <div 
              className="absolute left-10 sm:left-20 top-[18px] h-1 bg-[#111111] rounded-full transition-all duration-500 z-0" 
              style={{ width: `calc(${(activeStageIndex / (STAGES.length - 1)) * 100}% - ${(activeStageIndex / (STAGES.length - 1)) * 40}px)` }}
            />

            {STAGES.map((stage, idx) => {
              const isPast = idx < activeStageIndex;
              const isActive = idx === activeStageIndex;
              const isNextObjective = idx === activeStageIndex + 1;
              
              return (
                <div 
                  key={stage.id} 
                  className="flex flex-col items-center relative z-10 w-20 sm:w-24 text-center cursor-pointer group hover:z-[100]"
                  onClick={() => handleStageChange(stage.id)}
                >
                  {isActive && (
                    <>
                      <div className="absolute top-[18px] left-[calc(100%+4px)] h-[1px] w-7 rounded-full bg-slate-200" />
                      <motion.div
                        animate={{ x: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[15px] left-[calc(100%+10px)] h-2 w-2 rounded-full bg-[#111111] shadow-[0_0_0_4px_rgba(15,23,42,0.05)]"
                      />
                    </>
                  )}

                  {isNextObjective && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap hidden sm:block">
                      <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-200 animate-bounce">
                        Próximo
                      </span>
                    </div>
                  )}

                  <div 
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-sm mb-3 ${
                      isActive 
                        ? 'bg-[#111111] border-[#111111] text-white scale-110 shadow-lg shadow-black/20' 
                        : isPast 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-[0_0_0_0_rgba(16,185,129,0.16),0_10px_24px_rgba(16,185,129,0.20)]' 
                          : isNextObjective
                            ? 'bg-white border-blue-500 text-blue-600 animate-glow-pulse'
                            : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-700'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm" />
                    ) : (
                      <span className="text-[10px] sm:text-xs font-extrabold">{idx + 1}</span>
                    )}
                  </div>
                  
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-tight px-1 transition-colors ${isActive ? 'text-[#111111]' : 'text-slate-500 group-hover:text-slate-800'}`}>
                    {stage.label}
                  </span>

                  {/* Enhanced Tooltip - Positioned above with z-index to overlap everything */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 opacity-0 group-hover:opacity-100 transition-all duration-300 w-[220px] sm:w-64 bg-[#18181B] text-white text-[11px] rounded-2xl p-4 z-[200] shadow-[0_20px_50px_rgba(0,0,0,0.4)] pointer-events-none text-left border border-white/10 -translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                      <span className="font-black uppercase tracking-widest text-[9px] text-blue-400">{idx + 1}. {stage.label}</span>
                      {isPast && <Check className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <p className="text-white/80 leading-relaxed font-medium mb-3">{stage.description}</p>
                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-white/40 font-bold uppercase">Progresso Sugerido</span>
                      <span className="text-[10px] font-black text-white">{stage.progress}%</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#18181B] rotate-45 border-r border-b border-white/10" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Layout Tabs for focused study */}
      <div className="flex border-b border-slate-100 gap-1 sm:gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-3 sm:px-6 py-3.5 text-[11px] sm:text-xs font-extrabold border-b-2 transition-all whitespace-nowrap ${activeTab === 'journey' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'}`}
        >
          Foco do Estágio Ativo
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 sm:px-6 py-3.5 text-[11px] sm:text-xs font-extrabold border-b-2 transition-all whitespace-nowrap ${activeTab === 'ai' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'}`}
        >
          Consultor Executivo IA
        </button>
        <button
          onClick={() => setActiveTab('initiatives')}
          className={`px-3 sm:px-6 py-3.5 text-[11px] sm:text-xs font-extrabold border-b-2 transition-all whitespace-nowrap ${activeTab === 'initiatives' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'}`}
        >
          Central de Iniciativas
        </button>
      </div>

      {/* Main Content Areas */}
      <div className="w-full">
        {activeTab === 'journey' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Stage Mission Panel */}
            <div className="lg:col-span-2 bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-50 pb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  MISSÃO ATIVA DE EVOLUÇÃO
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#111111] mt-1">
                  {activeMission.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  <strong>Objetivo central:</strong> {activeMission.objective}
                </p>
              </div>

              {/* Progress Bar of tasks */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Conclusão da Missão</span>
                  <span>{checklistProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>

              {/* Interactive checklist */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Plano de Ação Sugerido
                </h4>
                <div className="space-y-2">
                  {activeChecklist.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => toggleChecklistItem(index)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${item.done ? 'bg-slate-50/50 border-slate-100 text-slate-400' : 'bg-white hover:bg-slate-50/40 border-slate-150 text-slate-700'}`}
                    >
                      <button className="shrink-0 mt-0.5">
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span className={`text-xs sm:text-sm font-semibold leading-relaxed ${item.done ? 'line-through' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentView(activeMission.view)}
                  className="bg-slate-50 hover:bg-slate-100 border border-[#0F172A15] text-[#111111] px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 group"
                >
                  Acessar Módulo Relacionado
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B] transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Quick Dynamic Advice Summary Card */}
            <div className="bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/70 border border-blue-100 py-1 px-2.5 rounded-lg inline-block">
                  Prioridade Executiva IA
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#111111] tracking-tight">
                    {calculatedPriority.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                    {calculatedPriority.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs border-t border-slate-50 pt-4 font-semibold">
                  <span className="text-slate-400">Impacto Esperado:</span>
                  <span className="text-amber-700 bg-amber-50 border border-amber-100/60 py-0.5 px-2 rounded font-extrabold text-[10px] uppercase">
                    {calculatedPriority.impact}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => setCurrentView(calculatedPriority.view)}
                  className="w-full bg-[#111111] hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {calculatedPriority.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="w-full text-[#64748B] hover:text-[#111111] hover:bg-slate-50 py-2.5 rounded-xl font-bold text-xs transition-colors text-center block"
                >
                  Consultar IA Detalhadamente
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111111]">
                  Consultoria Estratégica Integrada
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  O conselheiro de IA audita continuamente o workspace e suas transações para prover rotas de decisão.
                </p>
              </div>

              {/* Sub-tabs switch */}
              <div className="flex bg-slate-100/80 border border-[#0F172A05] p-1 rounded-xl">
                <button
                  onClick={() => setAiSubTab('strategic')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${aiSubTab === 'strategic' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#64748B] hover:text-[#111111]'}`}
                >
                  Visão de Negócio
                </button>
                <button
                  onClick={() => setAiSubTab('operational')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${aiSubTab === 'operational' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#64748B] hover:text-[#111111]'}`}
                >
                  Roteiro Operacional
                </button>
              </div>
            </div>

            {aiSubTab === 'strategic' ? (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Análise Geral de Saúde do Negócio
                    </h4>
                    <p className="text-[11px] text-[#64748B] font-medium max-w-xl leading-relaxed">
                      Compila propostas registradas, marcos técnicos e tração financeira para indicar riscos e mitigação tática.
                    </p>
                  </div>
                  <button
                    onClick={requestStrategicConsultancy}
                    disabled={loadingStrategic}
                    className="bg-[#111111] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                  >
                    {loadingStrategic ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {loadingStrategic ? "Analisando Workspace..." : "Solicitar Consultoria de Negócio"}
                  </button>
                </div>

                {/* Markdown View */}
                {strategicAdvice ? (
                  <div className="border border-[#0F172A08] rounded-2xl p-6 sm:p-8 bg-white/50 space-y-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block border-b border-slate-50 pb-2">
                      Análise Consolidada do Conselheiro
                    </span>
                    <div className="markdown-body text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                      <ReactMarkdown>{strategicAdvice}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">Clique no botão acima para receber o aconselhamento estratégico personalizado da IA.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        Desdobrar Iniciativa do Workspace
                      </h4>
                      <p className="text-[11px] text-[#64748B] font-medium leading-relaxed max-w-xl">
                        Escolha um projeto, produto ou tese ativamente cadastrado para desenhar um roteiro prático detalhado de sprints.
                      </p>
                    </div>
                    
                    {unifiedInitiatives.length > 0 && (
                      <button
                        onClick={requestOperationalConsultancy}
                        disabled={loadingOperational || !selectedOperationalInitiativeKey}
                        className="bg-[#111111] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                      >
                        {loadingOperational ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        {loadingOperational ? "Compilando Roteiro..." : "Solicitar Roteiro IA"}
                      </button>
                    )}
                  </div>

                  {unifiedInitiatives.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Iniciativa Alvo</label>
                        <select
                          value={selectedOperationalInitiativeKey}
                          onChange={(e) => setSelectedOperationalInitiativeKey(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-[#111111]"
                        >
                          {unifiedInitiatives.map((ini) => (
                            <option key={ini.key} value={ini.key}>
                              [{ini.typeLabel}] {ini.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Cadastre primeiro ideias, projetos ou produtos para poder requerer um roteiro tático da IA.
                    </p>
                  )}
                </div>

                {operationalAdvice ? (
                  <div className="border border-[#0F172A08] rounded-2xl p-6 sm:p-8 bg-white/50 space-y-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block border-b border-slate-50 pb-2">
                      Roteiro Executivo e Prático Prescrito
                    </span>
                    <div className="markdown-body text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                      <ReactMarkdown>{operationalAdvice}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">Selecione uma iniciativa e clique em Solicitar Roteiro IA.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'initiatives' && (
          <div className="bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                Central de Missões e Iniciativas
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Vincule uma missão executiva (prioridade de entrega) a cada uma de suas teses, projetos ou ofertas e acesse de forma ágil.
              </p>
            </div>

            {unifiedInitiatives.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Nenhuma iniciativa registrada. Registre ideias ou projetos para gerenciar metas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unifiedInitiatives.map((ini) => {
                  const missionText = activeWorkspace?.settings?.initiativeMissions?.[ini.key] || "";
                  const isEditing = editingMissionKey === ini.key;
                  
                  return (
                    <div key={ini.key} className="border border-slate-100 rounded-2xl p-5 space-y-4 hover:shadow-xs transition-shadow bg-slate-50/20">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className={ini.color}>{ini.typeLabel}</span>
                          <h4 className="text-sm font-bold text-[#111111] truncate">{ini.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{ini.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Status</span>
                          <span className="text-xs font-bold text-slate-700">{ini.status}</span>
                        </div>
                      </div>

                      {/* Initiative Strategic Mission */}
                      <div className="border-t border-slate-50 pt-3.5 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Missão Operacional Cadastrada</span>
                          {!isEditing && (
                            <button 
                              onClick={() => startEditMission(ini.key, missionText)}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Editar
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={tempMissionText}
                              onChange={(e) => setTempMissionText(e.target.value)}
                              placeholder="Descreva a meta operacional imediata desta iniciativa..."
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                              rows={3}
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingMissionKey(null)}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-600"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleUpdateInitiativeMission(ini.key)}
                                className="px-3.5 py-1.5 bg-[#111111] hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" /> Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-slate-700 bg-white/80 border border-slate-100 p-3 rounded-xl italic">
                            {missionText ? `"${missionText}"` : "Nenhuma missão atribuída. Clique em editar para criar uma meta de sprint."}
                          </p>
                        )}
                      </div>

                      {/* Action trigger button */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (ini.type === 'idea') setCurrentView('ideias');
                            else if (ini.type === 'project') {
                              setGlobalFilters({ companyId: activeWorkspace?.id, projectId: ini.id });
                              setCurrentView('projetos');
                            } else if (ini.type === 'product') {
                              setGlobalFilters({ companyId: activeWorkspace?.id, productId: ini.id });
                              setCurrentView('produtos');
                            }
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-[#111111] transition-colors flex items-center gap-1"
                        >
                          Ir para Módulo
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
