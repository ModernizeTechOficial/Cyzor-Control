import { View } from '../../types';
import { calculateStrategicPriority } from '../../utils/strategicPrioritizer';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface StrategicPriorityCardProps {
  setCurrentView: (view: View) => void;
  currentStage: string;
  ideas: any[];
  projects: any[];
  products: any[];
  clients: any[];
  finance: any[];
  tasks: any[];
}

export default function StrategicPriorityCard({
  setCurrentView,
  currentStage,
  ideas,
  projects,
  products,
  clients,
  finance,
  tasks
}: StrategicPriorityCardProps) {
  
  // Calculate priority using the strategic analysis utility
  const priority = calculateStrategicPriority({
    currentStage,
    ideas,
    projects,
    products,
    clients,
    finance,
    tasks
  });

  // Decide impact badge styles
  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'Muito Alto':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Alto':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Médio':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex flex-col justify-between gap-6 overflow-hidden relative"
    >
      {/* Subtle executive background accent */}
      <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-slate-50/40 to-transparent pointer-events-none" />

      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-100/30 py-1 px-2.5 rounded-full uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
            RECOMENDAÇÃO DA IA
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100/50 py-1 px-2.5 rounded-full uppercase">
            Estágio: {currentStage}
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#111111] tracking-tight">
            {priority.title}
          </h2>
          <p className="text-xs text-[#64748B] leading-relaxed font-medium">
            {priority.description}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-[#64748B]">Impacto esperado:</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getImpactStyles(priority.impact)}`}>
            {priority.impact}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full shrink-0 z-10">
        <button
          onClick={() => setCurrentView(priority.view)}
          className="w-full bg-[#111111] hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
        >
          Executar Ação
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        
        <button
          onClick={() => setCurrentView('roadmap')}
          className="w-full text-[#64748B] hover:text-[#111111] font-bold text-xs transition-all flex items-center justify-center gap-1.5 py-2.5 px-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100/50"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#94A3B8]" />
          Ver Planejamento
        </button>
      </div>
    </motion.div>
  );
}
