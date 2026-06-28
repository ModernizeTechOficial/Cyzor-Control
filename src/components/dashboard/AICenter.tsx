import { motion } from "motion/react";
import { Sparkles, CheckCircle2, AlertCircle, Clock, ChevronRight, MoreHorizontal } from "lucide-react";

interface Insight {
  id: string;
  type: 'high' | 'medium' | 'low';
  message: string;
  time: string;
}

export default function AICenter({ insights, onResolve }: { insights: Insight[], onResolve: (id: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#0F172A08] rounded-[32px] p-6 flex flex-col gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative overflow-hidden group/card"
    >
      {/* Subtle HUD grid background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-500 relative">
             <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity" />
             <Sparkles size={18} className="text-white relative z-10" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-display font-bold text-[#111111] tracking-tight">Intelligence</h3>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                Live Analysis
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        {insights.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ x: 4 }}
            className="group flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-transparent hover:border-[#0F172A08] hover:bg-white transition-all cursor-default"
          >
            <div className={`mt-1 flex-shrink-0`}>
              {item.type === 'high' ? (
                <div className="p-2 rounded-lg bg-red-50 text-red-500 border border-red-100 shadow-sm">
                  <AlertCircle size={14} strokeWidth={3} />
                </div>
              ) : item.type === 'medium' ? (
                <div className="p-2 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 shadow-sm">
                  <AlertCircle size={14} strokeWidth={3} />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-blue-50 text-blue-500 border border-blue-100 shadow-sm">
                  <CheckCircle2 size={14} strokeWidth={3} />
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm ${
                    item.type === 'high' ? 'bg-red-500 text-white' : 
                    item.type === 'medium' ? 'bg-orange-400 text-white' : 
                    'bg-blue-500 text-white'
                  }`}>
                    {item.type === 'high' ? 'Crítico' : item.type === 'medium' ? 'Atenção' : 'Info'}
                  </span>
                  <span className="text-[10px] font-bold text-[#64748B] opacity-60">{item.time}</span>
                </div>
              </div>
              <p className="text-[13px] font-bold text-[#111111] leading-relaxed tracking-tight">
                {item.message}
              </p>
              <div className="flex items-center gap-3 pt-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onResolve(item.id)}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                  Resolver
                </button>
                <div className="w-1 h-1 rounded-full bg-[#64748B]/20" />
                <button className="text-[10px] font-black uppercase tracking-widest text-[#64748B] hover:text-[#111111]">
                  Ignorar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-[#0F172A08] relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={12} />
              AI Timeline Feed
            </span>
            <div className="w-10 h-1 bg-[#F8FAFC] rounded-full overflow-hidden">
               <motion.div 
                className="h-full bg-blue-500"
                animate={{ x: [-40, 40] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               />
            </div>
          </div>
          
          <div className="flex flex-col gap-5 pl-3 border-l border-[#F1F5F9]">
            <div className="relative pl-5">
               <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#111111] ring-4 ring-white" />
               <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-[#64748B] tracking-wider">09:42 • ANALYSIS</span>
                  <span className="text-[12px] font-bold text-[#111111] tracking-tight">Novo insight estratégico para Projeto Cyzor</span>
               </div>
            </div>
            <div className="relative pl-5 opacity-50">
               <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#F1F5F9] ring-4 ring-white" />
               <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-[#64748B] tracking-wider">09:14 • RESOLVED</span>
                  <span className="text-[12px] font-bold text-[#111111] tracking-tight">Anomalia de receita resolvida em cluster-7</span>
               </div>
            </div>
          </div>
        </div>

        <button className="w-full mt-8 py-4 px-6 bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl flex items-center justify-between group hover:bg-[#111111] hover:text-white transition-all duration-300">
          <span className="text-[13px] font-bold">Relatório Executivo IA</span>
          <ChevronRight size={16} className="text-[#64748B] group-hover:translate-x-1 group-hover:text-white transition-all" />
        </button>
      </div>
    </motion.div>
  );
}
