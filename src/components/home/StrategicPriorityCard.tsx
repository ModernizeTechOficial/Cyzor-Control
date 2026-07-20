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
      className="w-full h-full bg-white/40 backdrop-blur-sm border border-white rounded-[32px] p-6 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:bg-white transition-colors duration-500"
    >
      {/* Subtle executive background accent */}
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-indigo-50/[0.1] to-transparent pointer-events-none group-hover:bg-indigo-50/20 transition-all duration-500" />
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 text-indigo-500/10 pointer-events-none group-hover:text-indigo-500/20 transition-colors duration-700"
      >
        <Sparkles size={160} />
      </motion.div>

      <div className="flex-1 flex flex-col gap-4 min-h-0 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100/50 py-1 px-3 rounded-xl uppercase flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
            IA Recomendação
          </span>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <h2 className="text-base font-display font-black text-[#0F172A] tracking-tight leading-tight">
            {priority.title}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {priority.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Impacto Estratégico:</span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border shadow-sm ${getImpactStyles(priority.impact)}`}>
            {priority.impact}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full mt-6 shrink-0 z-10">
        <button
          onClick={() => setCurrentView(priority.view)}
          className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-slate-900 to-slate-800 hover:from-indigo-600 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.7)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
          <span className="relative z-10 flex items-center gap-2">
            Executar Ação
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </span>
        </button>
        
        <button
          onClick={() => setCurrentView('roadmap')}
          className="w-full text-slate-400 hover:text-[#0F172A] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 py-3 px-4 hover:bg-slate-50 rounded-2xl"
        >
          <TrendingUp className="w-4 h-4" />
          Ver Roadmap Estratégico
        </button>
      </div>
    </motion.div>
  );
}
