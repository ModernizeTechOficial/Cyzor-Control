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
      className="w-full h-full bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-4 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Subtle executive background accent */}
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-50/40 to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-100/30 py-0.5 px-2 rounded-full uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-blue-500 animate-pulse" />
            RECOMENDAÇÃO DA IA
          </span>
        </div>

        <div className="flex flex-col gap-1 min-h-0">
          <h2 className="text-sm font-bold text-[#111111] tracking-tight line-clamp-1">
            {priority.title}
          </h2>
          <p className="text-[10px] text-[#64748B] leading-tight font-medium line-clamp-2 overflow-y-auto">
            {priority.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-[#64748B]">Impacto:</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded border ${getImpactStyles(priority.impact)}`}>
            {priority.impact}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full mt-3 shrink-0 z-10">
        <button
          onClick={() => setCurrentView(priority.view)}
          className="w-full bg-[#111111] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 group shadow-sm"
        >
          Executar Ação
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
        
        <button
          onClick={() => setCurrentView('roadmap')}
          className="w-full text-[#64748B] hover:text-[#111111] font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 py-1.5 px-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100/50"
        >
          <TrendingUp className="w-3 h-3 text-[#94A3B8]" />
          Planejamento
        </button>
      </div>
    </motion.div>
  );
}
