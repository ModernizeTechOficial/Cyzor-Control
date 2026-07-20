import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, Layers, ShieldCheck, Zap, X } from 'lucide-react';

export default function HomeHeader() {
  const { user, activeWorkspace } = useAuth();
  const [isAiAdviceVisible, setIsAiAdviceVisible] = useState(true);

  useEffect(() => {
    const storageKey = `cyzor-home-ai-advice-dismissed:${activeWorkspace?.id || 'default'}`;
    const storedValue = window.localStorage.getItem(storageKey);
    setIsAiAdviceVisible(storedValue !== 'true');
  }, [activeWorkspace?.id]);

  const handleDismissAiAdvice = () => {
    const storageKey = `cyzor-home-ai-advice-dismissed:${activeWorkspace?.id || 'default'}`;
    window.localStorage.setItem(storageKey, 'true');
    setIsAiAdviceVisible(false);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const currentStage = activeWorkspace?.settings?.stage || 'Ideia';

  const getAiAdvice = (stage: string) => {
    switch (stage) {
      case 'Ideia':
        return 'Sua empresa está no estágio de Ideia. Foco estratégico: Estruturar o conceito do negócio e validar a dor inicial. Comece cadastrando sua ideia para mapear a Proposta de Valor.';
      case 'Validação':
        return 'Sua empresa está no estágio de Validação. Foco estratégico: Realizar entrevistas qualitativas com potenciais clientes para validar a aderência da sua proposta de valor.';
      case 'Projeto':
        return 'Sua empresa está no estágio de Projeto. Foco estratégico: Definir o escopo, cronograma e metas de entrega do MVP. Estruture o roteiro inicial do projeto.';
      case 'Planejamento':
        return 'Sua empresa está no estágio de Planejamento. Foco estratégico: Detalhar o backlog, cronograma financeiro e mapear riscos de execução da sua iniciativa.';
      case 'Desenvolvimento':
        return 'Sua empresa está no estágio de Desenvolvimento. Foco estratégico: Executar o backlog do MVP e monitorar os cronogramas de entrega e tarefas ativas.';
      case 'Produto':
        return 'Sua empresa está no estágio de Produto. Foco estratégico: Lançar o MVP no mercado e coletar feedback de usabilidade com seus primeiros usuários ativos.';
      case 'Clientes':
        return 'Sua empresa está no estágio de Clientes. Foco estratégico: Estruturar o funil de aquisição, habilitar canais de captação e monitorar o churn inicial.';
      case 'Financeiro':
        return 'Sua empresa está no estágio de Financeiro. Foco estratégico: Organizar o fluxo de caixa, otimizar custos operacionais e validar a precificação da sua solução.';
      case 'Crescimento':
        return 'Sua empresa está no estágio de Crescimento. Foco estratégico: Escalar os canais de marketing e otimizar taxas de conversão de ponta a ponta.';
      case 'Gestão':
        return 'Sua empresa está no estágio de Gestão. Foco estratégico: Consolidar processos internos, relatórios executivos de DRE, metas de governança e novos horizontes de expansão.';
      default:
        return 'Seu ecossistema encontra-se saudável e em evolução constante. Foque nas tarefas e missões prioritárias do seu estágio de maturidade.';
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 pt-2"
    >
      {/* Executive Meta Ribbons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Workspace Ativo</span>
          <span className="text-[#E2E8F0] text-sm">/</span>
          <span className="text-[11px] text-[#111111] font-bold flex items-center gap-1.5">
            {activeWorkspace?.name || 'Workspace Principal'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1.5">
            <Zap size={10} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Plano Enterprise</span>
          </div>
        </div>
      </div>

      {/* Greeting & AI Executive Advice Panel */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0F172A] tracking-tight leading-tight">
            {getGreeting()}, <span className="text-slate-400 font-medium">{user?.displayName || user?.email?.split('@')[0] || 'Diretor'}</span>.
          </h1>
        </div>
        
        {isAiAdviceVisible && (
          <div className="relative group flex items-start gap-4 bg-white border border-[#0F172A08] p-5 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300">
            <button
              onClick={handleDismissAiAdvice}
              className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-full hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Fechar conselho da IA"
            >
              <X size={14} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Inteligência Operacional</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cyzor IA</span>
              </div>
              <p className="text-[14px] text-[#334155] font-medium mt-1.5 leading-relaxed max-w-3xl">
                "{getAiAdvice(currentStage)}"
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
