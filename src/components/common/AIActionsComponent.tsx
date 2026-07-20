import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Bot, 
  ChevronDown, 
  X, 
  Copy, 
  Check, 
  ArrowRight,
  BarChart2, 
  Cpu, 
  TrendingUp, 
  Coins, 
  FileText, 
  Target,
  CornerDownRight,
  MessageSquare,
  Zap,
  Info
} from 'lucide-react';
import { AIActions } from '../../ai/AIEngine';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const actionIcons: Record<string, React.ComponentType<any>> = {
  analyzeProject: BarChart2,
  generateRoadmap: Cpu,
  evaluateIdea: TrendingUp,
  createFinancialPlan: Coins,
  improveDocument: FileText,
  createOKRs: Target,
};

interface AIActionButtonProps {
  actionId: keyof typeof AIActions;
  entityId: string;
  variant?: 'button' | 'icon' | 'dropdown-item';
  onSuccess?: (result: string) => void;
  onError?: (error: any) => void;
  className?: string;
}

export const AIActionButton: React.FC<AIActionButtonProps> = ({ 
  actionId, 
  entityId, 
  variant = 'button',
  onSuccess,
  onError,
  className = ''
}) => {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const action = AIActions[actionId];

  if (!action) return null;

  const handleExecute = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: actionId as string,
          entityId
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao executar ação de IA');
      }

      const data = await response.json();
      const result = data.text;
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        console.log('AI Result:', result);
      }
    } catch (err) {
      console.error('AI Action error:', err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'dropdown-item') {
    return (
      <button 
        onClick={handleExecute}
        disabled={loading}
        className={`w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-2.5 transition-all duration-150 border-b border-slate-50 last:border-b-0 cursor-pointer disabled:opacity-50 ${className}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-purple-500 shrink-0" /> : <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />}
        <span className="truncate">{action.label}</span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleExecute}
        disabled={loading}
        title={action.label}
        className={`p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors ${className}`}
      >
         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleExecute}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      <span>{action.label}</span>
    </button>
  );
};

export const AIActionDropdown: React.FC<{ 
  entityId: string;
  actions: (keyof typeof AIActions)[];
  className?: string;
  variant?: 'purple' | 'slate' | 'compact';
}> = ({ entityId, actions, className = '', variant = 'purple' }) => {
  const { fetchWithAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<keyof typeof AIActions | null>(null);
  const [additionalInput, setAdditionalInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getButtonStyles = () => {
    switch (variant) {
      case 'slate':
        return 'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 hover:text-purple-300 transition-all duration-200 cursor-pointer shadow-sm';
      case 'compact':
        return 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 hover:text-purple-300 transition-all duration-200 cursor-pointer';
      case 'purple':
      default:
        return 'inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/15 transition-all duration-200 border border-purple-500/30 cursor-pointer';
    }
  };

  const getIconSize = () => {
    return variant === 'compact' ? 12 : 14;
  };

  // Sequenced loading labels
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 3);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleRunAction = async (actionId: keyof typeof AIActions) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetchWithAuth('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: actionId as string,
          entityId,
          additionalInput: additionalInput.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao executar ação de IA');
      }

      const data = await response.json();
      setResult(data.text);
    } catch (err) {
      console.error('AI Action error:', err);
      setResult('### ❌ Erro na Execução\nOcorreu um erro ao conectar com o serviço de Inteligência Artificial. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state when closed
    setSelectedActionId(null);
    setAdditionalInput('');
    setResult(null);
    setLoading(false);
  };

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 0: return 'Carregando o contexto corporativo e mapeando registros...';
      case 1: return 'Analisando dependências com o modelo inteligente Cyzor...';
      case 2: return 'Consolidando diagnóstico e gerando plano de ação estratégico...';
      default: return 'Processando...';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={getButtonStyles()}
      >
        <Bot size={getIconSize()} className="animate-pulse" />
        <span>Ações IA</span>
        <ChevronDown size={getIconSize()} />
      </button>

      {/* Futuristic Command Center Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Dark glass backdrop with high blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-[#060709]/80 backdrop-blur-xl"
            />

            {/* Glowing cosmic ambient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Command Center Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative bg-[#0E1015]/90 border border-white/10 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              {/* Premium top gradient line */}
              <div className="h-[2px] w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <Bot size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white">Assistente de IA Cyzor</h2>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-widest border border-purple-500/30">
                        Premium
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Diagnósticos e ações estratégicas orientadas a dados</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Dynamic Scrollable Content */}
              <div className="flex-grow overflow-y-auto p-6 scrollbar-thin">
                
                {/* STATE 1: Actions Selection List */}
                {!selectedActionId && !loading && !result && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="text-center py-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Selecione o plano de ação desejado</h3>
                      <p className="text-[11px] text-slate-500">A inteligência artificial mapeará todo o contexto para gerar os insights recomendados.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {actions.map((actId) => {
                        const act = AIActions[actId];
                        if (!act) return null;
                        const IconComponent = actionIcons[actId] || Sparkles;

                        return (
                          <button
                            key={String(actId)}
                            onClick={() => setSelectedActionId(actId)}
                            className="group text-left p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden"
                          >
                            {/* Accent background glow on hover */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />

                            <div className="flex items-start justify-between w-full">
                              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all">
                                <IconComponent size={20} />
                              </div>
                              <ArrowRight size={14} className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                {act.label}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {act.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STATE 2: Customize Selected Action Prompt */}
                {selectedActionId && !loading && !result && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Active Action Overview Card */}
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                        {React.createElement(actionIcons[selectedActionId] || Sparkles, { size: 20 })}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                          {AIActions[selectedActionId]?.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {AIActions[selectedActionId]?.description}
                        </p>
                      </div>
                    </div>

                    {/* Instruction input area */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                          <MessageSquare size={13} className="text-purple-400" />
                          <span>Observações ou Instruções Extras (Opcional)</span>
                        </label>
                        <span className="text-[10px] text-slate-500">Personalize o foco da IA</span>
                      </div>
                      <textarea
                        value={additionalInput}
                        onChange={(e) => setAdditionalInput(e.target.value)}
                        placeholder="Ex: Foque apenas em faturamento, desconsidere o setor de infraestrutura, sugira ações viáveis com custo zero..."
                        className="w-full h-24 px-4 py-3 rounded-xl bg-[#13151A] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none transition-all"
                      />
                    </div>

                    {/* Guidelines Callout */}
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex gap-2.5 items-start">
                      <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Ao clicar em executar, o assistente buscará os dados estruturados reais desta página (como roadmaps, equipe, faturamento, indicadores) para criar uma análise sob medida para o seu negócio.
                      </p>
                    </div>

                    {/* Button Controls */}
                    <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={() => setSelectedActionId(null)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => handleRunAction(selectedActionId)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/10 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Zap size={13} className="animate-pulse" />
                        <span>Iniciar Análise Inteligente</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STATE 3: Loading animation state */}
                {loading && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
                    <div className="relative">
                      {/* Pulse circle glow */}
                      <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-ping opacity-75" />
                      
                      {/* Rotating futuristic AI brain orbit */}
                      <div className="w-16 h-16 rounded-full border-4 border-dashed border-purple-500/40 animate-spin flex items-center justify-center p-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                          <Bot size={20} className="animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 animate-pulse">
                        Processando Requisição
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono h-8">
                        {getLoadingMessage()}
                      </p>
                    </div>

                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-[shimmer_1.5s_infinite]" style={{
                        animation: 'progressMove 2s infinite linear'
                      }} />
                    </div>

                    {/* Styling override inject for simple loader bar animation */}
                    <style>{`
                      @keyframes progressMove {
                        0% { left: -30%; width: 30%; }
                        50% { width: 50%; }
                        100% { left: 100%; width: 30%; }
                      }
                    `}</style>
                  </div>
                )}

                {/* STATE 4: Show detailed formatted Markdown result */}
                {result && (
                  <div className="space-y-5 animate-in fade-in duration-300 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Diagnóstico Concluído</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Modelo: Claude 3.5 Sonnet / Gemini</span>
                    </div>

                    {/* Premium glass-morphic code block container */}
                    <div className="bg-[#08090C] border border-white/10 rounded-2xl p-6 overflow-y-auto max-h-[50vh] scrollbar-thin shadow-inner relative group">
                      <div className="prose prose-invert prose-sm text-slate-300 max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:leading-relaxed prose-li:my-1 prose-strong:text-purple-300">
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Bottom toolbar for results */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          setResult(null);
                          setAdditionalInput('');
                        }}
                        className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap size={12} />
                        <span>Fazer outro diagnóstico</span>
                      </button>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleCopy}
                          className={`flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${
                            copied 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copiado!' : 'Copiar Diagnóstico'}</span>
                        </button>

                        <button
                          onClick={handleClose}
                          className="flex-grow sm:flex-grow-0 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Fechar Painel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
