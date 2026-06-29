import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function HomeHeader() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 pt-2"
    >
      {/* Executive Meta Ribbons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#0F172A05]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#111111]">Cyzor Control</span>
          <span className="text-[#E2E8F0] text-sm">/</span>
          <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
            <Layers size={12} className="text-[#94A3B8]" /> Workspace Principal
          </span>
          <span className="text-[#E2E8F0] text-sm">/</span>
          <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
            <Zap size={12} className="text-[#94A3B8]" /> Plano Enterprise
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-[#94A3B8] font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#10B981]" /> Prod-Env
          </span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span className="flex items-center gap-1">
            <RefreshCw size={11} className="animate-spin-slow text-slate-400" /> Sinc: Hoje, agora mesmo
          </span>
        </div>
      </div>

      {/* Greeting & AI Executive Advice Panel */}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-3xl font-black text-[#111111] tracking-tight leading-none">
          {getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'Diretor'}.
        </h1>
        
        <div className="flex items-start gap-3 bg-gradient-to-r from-slate-50 to-white border border-[#0F172A03] p-4 rounded-[20px]">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Cyzor IA • Consultor de Operações</span>
            <p className="text-[13px] text-[#334155] font-medium mt-1 leading-relaxed">
              "Seu ecossistema encontra-se saudável. Existem apenas dois pontos que merecem atenção hoje no cronograma de deploys."
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
