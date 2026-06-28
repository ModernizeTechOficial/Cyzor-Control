import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface DashboardHeroProps {
  stats: {
    activeProjects: number;
    pendingDecisions: number;
    criticalRisks: number;
    productivity: string;
  };
  aiMessage: string;
  onOpenAI: () => void;
  onResolve: () => void;
}

export default function DashboardHero({ stats, aiMessage, onOpenAI, onResolve }: DashboardHeroProps) {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <section className="relative">
      {/* Background HUD elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 opacity-[0.03] pointer-events-none">
         <div className="w-full h-full rounded-full border border-[#111] [mask-image:radial-gradient(circle,white,transparent)]" />
      </div>

      <div className="flex flex-col gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] px-2 py-1 bg-blue-50/50 rounded-md border border-blue-100/50">System Live</span>
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <div className="ml-4 flex items-center gap-4 bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-[#0F172A05]">
                <div className="flex items-center gap-1.5">
                   <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">Business Health</span>
                   <span className="text-[10px] font-black text-emerald-500">98%</span>
                </div>
                <div className="w-px h-2 bg-[#0F172A08]" />
                <div className="flex items-center gap-1.5">
                   <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">IA Score</span>
                   <span className="text-[10px] font-black text-blue-500">94.2</span>
                </div>
             </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-[#111111] tracking-tighter leading-[0.95]">
            {getGreeting()}, <span className="text-[#111111]/40">{user?.displayName?.split(' ')[0] || 'Gestor'}</span>.
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
              <span className="text-[13px] font-bold text-[#64748B] tracking-tight group-hover:text-[#111111] transition-colors">
                <span className="text-[#111111]">{stats.activeProjects}</span> projetos ativos
              </span>
            </div>
            <div className="w-px h-3 bg-[#111111]/10 hidden sm:block" />
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)] group-hover:scale-125 transition-transform" />
              <span className="text-[13px] font-bold text-[#64748B] tracking-tight group-hover:text-[#111111] transition-colors">
                <span className="text-[#111111]">{stats.pendingDecisions}</span> decisões pendentes
              </span>
            </div>
            <div className="w-px h-3 bg-[#111111]/10 hidden sm:block" />
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:scale-125 transition-transform" />
              <span className="text-[13px] font-bold text-[#64748B] tracking-tight group-hover:text-[#111111] transition-colors">
                <span className="text-[#111111]">{stats.criticalRisks}</span> riscos críticos
              </span>
            </div>
            <div className="w-px h-3 bg-[#111111]/10 hidden sm:block" />
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] group-hover:scale-125 transition-transform" />
              <span className="text-[13px] font-bold text-[#64748B] tracking-tight group-hover:text-[#111111] transition-colors">
                produtividade <span className="text-[#111111]">{stats.productivity}</span>
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "circOut" }}
          className="group relative bg-white border border-[#0F172A08] rounded-[40px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] transition-all duration-700"
        >
          {/* Subtle technical background detail */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.025] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
             <svg width="160" height="160" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <path d="M50 2L50 98" stroke="currentColor" strokeWidth="0.5" />
                <path d="M2 50L98 50" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="0.5" />
             </svg>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-[#111111] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl relative">
                <div className="absolute inset-0 rounded-[24px] bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles size={28} className="text-white relative z-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Cyzor Intelligence Analysis</span>
                <p className="text-xl sm:text-2xl font-bold text-[#111111] leading-[1.1] tracking-tight max-w-2xl">
                  "{aiMessage}"
                </p>
                <div className="flex items-center gap-4 mt-2">
                   <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      Análise processada há 4 minutos
                   </span>
                   <div className="w-1 h-1 rounded-full bg-[#64748B]/20" />
                   <span className="text-[11px] font-bold text-[#64748B]">Score de Confiança: 98.4%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button 
                onClick={onResolve}
                className="px-8 py-4 bg-[#111111] text-white rounded-[20px] text-sm font-bold shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:bg-black hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-3"
              >
                Resolver Agora
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={onOpenAI}
                className="px-8 py-4 bg-white border border-[#0F172A0F] text-[#111111] rounded-[20px] text-sm font-bold hover:bg-[#F8FAFC] hover:translate-y-[-2px] transition-all active:scale-95 shadow-sm"
              >
                Abrir Painel IA
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
