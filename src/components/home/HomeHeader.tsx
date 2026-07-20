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
          <div className="px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Zap size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Enterprise</span>
          </div>
        </div>
      </div>

      {/* Greeting & AI Executive Advice Panel */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">
              {getGreeting()},
            </span>
            <span className="text-slate-400 font-medium ml-2">{user?.displayName || user?.email?.split('@')[0] || 'Diretor'}</span>.
          </h1>
        </div>
        
        {isAiAdviceVisible && (
          <div className="relative group flex items-start gap-5 bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.08)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/30 pointer-events-none" />
            <button
              onClick={handleDismissAiAdvice}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10 shadow-sm"
              aria-label="Fechar conselho da IA"
            >
              <X size={14} />
            </button>
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-inner border border-white">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="relative flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Inteligência Operacional</span>
                <span className="w-1 h-1 bg-indigo-200 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cyzor IA</span>
              </div>
              <p className="text-[14px] text-slate-700 font-medium leading-relaxed max-w-3xl">
                "{getAiAdvice(currentStage)}"
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
