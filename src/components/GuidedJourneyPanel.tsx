import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { View } from '../types';
import { 
  Sparkles, ChevronRight, CheckCircle2, GitBranch, 
  Layers, Users, DollarSign, TrendingUp, HelpCircle,
  Play, Settings, ArrowRight, Lightbulb, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showSuccess, showError } from '../lib/alerts';

const JOURNEY_STEPS = [
  { id: 'Ideia', label: 'Ideia', desc: 'Estruturação inicial', color: 'text-amber-500 bg-amber-50' },
  { id: 'Validação', label: 'Validação', desc: 'Entrevistas e modelo', color: 'text-orange-500 bg-orange-50' },
  { id: 'Projeto', label: 'Projeto', desc: 'Escopo e metas', color: 'text-sky-500 bg-sky-50' },
  { id: 'Planejamento', label: 'Planejamento', desc: 'Roadmap e backlog', color: 'text-indigo-500 bg-indigo-50' },
  { id: 'Desenvolvimento', label: 'Desenvolvimento', desc: 'Construindo o MVP', color: 'text-blue-500 bg-blue-50' },
  { id: 'Produto', label: 'Produto', desc: 'Lançamento comercial', color: 'text-purple-500 bg-purple-50' },
  { id: 'Clientes', label: 'Clientes', desc: 'Primeiras vendas', color: 'text-pink-500 bg-pink-50' },
  { id: 'Financeiro', label: 'Financeiro', desc: 'Faturamento e custos', color: 'text-emerald-500 bg-emerald-50' },
  { id: 'Crescimento', label: 'Crescimento', desc: 'KPIs e escalabilidade', color: 'text-teal-500 bg-teal-50' },
  { id: 'Gestão', label: 'Gestão', desc: 'Excelência operacional', color: 'text-slate-500 bg-slate-50' }
];

const RECOMMENDATIONS: Record<string, { title: string; desc: string; buttonText: string; targetView: View; actionType: string }> = {
  'Ideia': {
    title: 'Validar hipóteses com o mercado',
    desc: 'Antes de investir tempo e capital, converse com potenciais clientes. Mapeie se o problema realmente incomoda o mercado.',
    buttonText: 'Acessar Banco de Ideias',
    targetView: 'ideias',
    actionType: 'navigate'
  },
  'Validação': {
    title: 'Consolidar hipóteses em um Projeto',
    desc: 'Ideia validada! Chegou a hora de estruturar o escopo operacional de entrega definindo um projeto inicial de implantação.',
    buttonText: 'Criar Projeto de Execução',
    targetView: 'projetos',
    actionType: 'create_project'
  },
  'Projeto': {
    title: 'Definir o Roadmap e Backlog',
    desc: 'Com o projeto operacional criado, mapeie as principais tarefas e sprints de desenvolvimento necessárias para o lançamento.',
    buttonText: 'Mapear Tarefas no Workspace',
    targetView: 'projetos',
    actionType: 'navigate'
  },
  'Planejamento': {
    title: 'Iniciar ciclo de Desenvolvimento ativo',
    desc: 'Roadmap definido! Coloque a mão na massa executando as tarefas do backlog e documentando as especificações técnicas.',
    buttonText: 'Acessar Projetos / Atividades',
    targetView: 'projetos',
    actionType: 'navigate'
  },
  'Desenvolvimento': {
    title: 'Modelar e Publicar o Produto Comercial',
    desc: 'O MVP está tomando forma. Crie a entidade do produto comercial na plataforma para estruturar planos e preços de comercialização.',
    buttonText: 'Evoluir para Produto Comercial',
    targetView: 'produtos',
    actionType: 'create_product'
  },
  'Produto': {
    title: 'Cadastrar os Primeiros Clientes e Leads',
    desc: 'Produto ativo no mercado! Comece a catalogar os contatos dos primeiros interessados ou clientes beta para iniciar o ciclo comercial.',
    buttonText: 'Cadastrar Primeiro Cliente',
    targetView: 'clientes',
    actionType: 'create_client'
  },
  'Clientes': {
    title: 'Configurar o Módulo Financeiro',
    desc: 'Clientes ativos geram fluxo financeiro. Configure suas primeiras receitas recorrentes ou despesas para acompanhar seu caixa.',
    buttonText: 'Cadastrar Transação Financeira',
    targetView: 'financeiro',
    actionType: 'create_finance'
  },
  'Financeiro': {
    title: 'Acompanhar Indicadores de Crescimento',
    desc: 'Faturamento estruturado! Analise métricas-chave de crescimento corporativo como receita total, progresso de projetos e eficiência.',
    buttonText: 'Analisar Indicadores de Desempenho',
    targetView: 'dashboard',
    actionType: 'ai_advice'
  },
  'Crescimento': {
    title: 'Otimizar Processos com a Cyzor IA',
    desc: 'Com faturamento e escala robustos, aproveite nossa Inteligência Artificial para identificar gargalos e automatizar fluxos de trabalho.',
    buttonText: 'Consultar Cyzor IA',
    targetView: 'ia',
    actionType: 'navigate'
  },
  'Gestão': {
    title: 'Excelente! Sua empresa opera em plena escala',
    desc: 'Você completou as principais fundações! Mantenha o ciclo de melhoria contínua registrando novas ideias estratégicas de expansão.',
    buttonText: 'Registrar Nova Ideia de Expansão',
    targetView: 'ideias',
    actionType: 'navigate'
  }
};

export default function GuidedJourneyPanel({ 
  setCurrentView,
  metrics,
  onRefreshData
}: { 
  setCurrentView: (view: View) => void;
  metrics?: any;
  onRefreshData?: () => void;
}) {
  const { activeWorkspace, fetchWithAuth, updateSaaSBackend } = useAuth();
  const { setGlobalFilters } = useNavigation();
  
  const currentStage = activeWorkspace?.settings?.stage || 'Ideia';
  const currentStepIndex = JOURNEY_STEPS.findIndex((s) => s.id === currentStage);
  
  const [isEvolving, setIsEvolving] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('Analisando as métricas corporativas do seu Workspace para otimizar os fluxos de trabalho...');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Dynamic advice from simulated "Cyzor IA Consultant" based on stage and active workspace metrics
  useEffect(() => {
    setIsAiLoading(true);
    const getAdvice = () => {
      const companyCount = metrics?.companies || 0;
      const projectCount = metrics?.projects || 0;
      const productCount = metrics?.products || 0;
      const clientCount = metrics?.clients || 0;

      switch(currentStage) {
        case 'Ideia':
          return `Sua empresa está em fase embrionária. Com ${projectCount} projetos e ${clientCount} clientes, nosso conselho de IA hoje é focar 100% na validação da proposta de valor. Evite gastar com infraestrutura pesada agora.`;
        case 'Validação':
          return `Recomendação de Operações: Você tem ${companyCount} divisões registradas. Sugerimos entrevistar pelo menos 10 potenciais clientes esta semana para consolidar a validação antes de codificar qualquer funcionalidade.`;
        case 'Projeto':
          return `Métricas do Workspace: Existem ${projectCount} projetos no pipeline. Atenção ao escopo! Garanta que o projeto principal de implantação tenha critérios de aceitação claros definidos no modal de detalhes.`;
        case 'Planejamento':
          return `Análise de Roadmaps: Com as atividades atuais, estimamos um ciclo inicial de 3 semanas para o MVP. Mantenha os objetivos de entrega curtos para coletar feedback rápido.`;
        case 'Desenvolvimento':
          return `Gargalos Técnicos: O desenvolvimento está avançando. Recomendamos que você vincule seu projeto a um Produto Comercial assim que os principais fluxos de cadastro e pagamento estiverem estáveis.`;
        case 'Produto':
          return `Lançamento de Mercado: Você possui ${productCount} produtos estruturados. O foco operacional agora deve mudar de engenharia para marketing. Mapeie canais de tração iniciais hoje mesmo.`;
        case 'Clientes':
          return `Sucesso do Cliente: Você já possui ${clientCount} clientes cadastrados! Monitore de perto a primeira experiência deles com o produto para mitigar o risco de churn inicial.`;
        case 'Financeiro':
          const rev = metrics?.revenue ? `R$ ${(metrics.revenue * 1000).toLocaleString('pt-BR')}` : 'R$ 0';
          return `Fluxo de Caixa: Faturamento acumulado estimado em ${rev}. É hora de auditar suas contas a pagar e a receber para manter a saúde financeira em dia.`;
        case 'Crescimento':
          return `Inteligência Corporativa: Identificamos que a taxa de retenção de clientes é saudável. Recomendamos escalar o investimento em canais de aquisição pagos para acelerar as vendas.`;
        case 'Gestão':
          return `Maturidade Operacional: Sua empresa está no nível máximo de maturidade no ecossistema Cyzor Control. Utilize o estúdio de fluxos visuais para automatizar processos de equipe recorrentes.`;
        default:
          return 'Seu ecossistema corporativo encontra-se estável. Continue alimentando a plataforma para novos relatórios.';
      }
    };

    const timer = setTimeout(() => {
      setAiAdvice(getAdvice());
      setIsAiLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentStage, metrics]);

  const handleEvolveStage = async () => {
    if (currentStepIndex >= JOURNEY_STEPS.length - 1) {
      showSuccess('Parabéns! Sua empresa atingiu a etapa de maturidade máxima!');
      return;
    }
    
    setIsEvolving(true);
    const nextStage = JOURNEY_STEPS[currentStepIndex + 1].id;
    
    try {
      const res = await fetchWithAuth(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            stage: nextStage
          }
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao avançar estágio');
      }

      showSuccess(`Evolução Concluída! Sua empresa avançou para a etapa de: ${nextStage}`);
      
      // Update local state and trigger refresh
      await updateSaaSBackend(undefined, activeWorkspace.id);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error(err);
      showError('Não foi possível evoluir o estágio de negócios.');
    } finally {
      setIsEvolving(false);
    }
  };

  const handleRecommendationAction = async (rec: typeof RECOMMENDATIONS[string]) => {
    if (rec.actionType === 'navigate') {
      setCurrentView(rec.targetView);
    } else if (rec.actionType === 'create_project') {
      // Direct action to create project
      setCurrentView('projetos');
      setTimeout(() => {
        // Trigger create project modal in the Projects view by firing event
        window.dispatchEvent(new Event('trigger-create-project-modal'));
      }, 150);
    } else if (rec.actionType === 'create_product') {
      setCurrentView('produtos');
      setTimeout(() => {
        window.dispatchEvent(new Event('trigger-create-product-modal'));
      }, 150);
    } else if (rec.actionType === 'create_client') {
      setCurrentView('clientes');
    } else if (rec.actionType === 'create_finance') {
      setCurrentView('financeiro');
    } else if (rec.actionType === 'ai_advice') {
      showSuccess('Análise avançada iniciada! Consulte o módulo de Inteligência.');
      setCurrentView('ia');
    }
  };

  const getProgressPercentage = () => {
    return ((currentStepIndex + 1) / JOURNEY_STEPS.length) * 100;
  };

  const rec = RECOMMENDATIONS[currentStage] || RECOMMENDATIONS['Ideia'];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#0F172A0C] rounded-[32px] p-6 sm:p-8 shadow-[0_15px_45px_rgba(15,23,42,0.03)] flex flex-col gap-6"
    >
      {/* Title & Stage Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp size={20} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest font-mono">Plano de Evolução Guiada</span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Jornada de Maturidade Digital</h2>
          </div>
        </div>

        {/* Action button to Evolve Stage */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Estágio Corporativo</span>
            <span className="text-xs font-black text-indigo-600 font-mono">{currentStepIndex + 1} de 10 — {currentStage}</span>
          </div>

          <button
            onClick={handleEvolveStage}
            disabled={isEvolving || currentStepIndex >= JOURNEY_STEPS.length - 1}
            className="px-4 py-2 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-2"
          >
            {isEvolving ? 'Evoluindo...' : (
              <>
                <span>Marcar Etapa Concluída</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 10 Step Interactive Timeline Map */}
      <div className="flex flex-col gap-3">
        {/* Dynamic horizontal timeline container */}
        <div className="overflow-x-auto pb-2 -mx-6 px-6 sm:-mx-8 sm:px-8 custom-scrollbar">
          <div className="flex items-center gap-2 min-w-[1000px] py-1">
            {JOURNEY_STEPS.map((step, idx) => {
              const isActive = step.id === currentStage;
              const isPast = idx < currentStepIndex;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex-1 flex flex-col gap-2 p-3 rounded-2xl border text-left transition-all ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/25 ring-1 ring-indigo-600' 
                      : isPast
                        ? 'border-emerald-100 bg-emerald-50/10'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                    {isPast ? (
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className={`text-xs font-black ${isActive ? 'text-indigo-900' : isPast ? 'text-slate-600' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium truncate">
                      {step.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-400 font-mono tracking-wider leading-none">
            {Math.round(getProgressPercentage())}% MATURIDADE
          </span>
        </div>
      </div>

      {/* Intelligent recommendation & AI card (Bento grid style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        
        {/* Recommended Action Card */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between text-left gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Próxima Ação Prioritária</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Lightbulb size={16} className="text-amber-500" />
              {rec.title}
            </span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              {rec.desc}
            </p>
          </div>

          <div>
            <button 
              onClick={() => handleRecommendationAction(rec)}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{rec.buttonText}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* AI Consultor de Negócios Card */}
        <div className="p-5 bg-indigo-950 text-white rounded-2xl border border-indigo-900/40 flex flex-col justify-between text-left gap-4 relative overflow-hidden">
          {/* subtle pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-1.5 z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Cyzor IA • Inteligência de Negócios</span>
              <div className="flex items-center gap-1 bg-indigo-900/50 px-2 py-0.5 rounded-full border border-indigo-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-indigo-200">CONSELHO ATIVO</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isAiLoading ? (
                <div className="py-2 flex items-center gap-2 text-indigo-200 text-xs font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400/20 border-t-indigo-200 rounded-full animate-spin" />
                  <span>Analisando Workspace...</span>
                </div>
              ) : (
                <motion.p 
                  key={aiAdvice}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-indigo-100 font-medium leading-relaxed"
                >
                  "{aiAdvice}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="z-10">
            <button 
              onClick={() => setCurrentView('ia')}
              className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>Consultoria Estratégica Completa</span>
            </button>
          </div>
        </div>

      </div>

    </motion.section>
  );
}
