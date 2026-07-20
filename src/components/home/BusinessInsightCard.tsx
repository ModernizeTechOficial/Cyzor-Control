import { Sparkles, ArrowRight } from 'lucide-react';
import { View } from '../../types';
import { motion } from 'motion/react';

interface BusinessInsightCardProps {
  setCurrentView: (view: View) => void;
  currentStage: string;
}

export default function BusinessInsightCard({ setCurrentView, currentStage }: BusinessInsightCardProps) {
  
  // Logic: Simple mapping based on current stage for now
  const getInsight = () => {
    switch (currentStage) {
      case 'Ideia':
        return "Sua empresa está em fase inicial. O foco agora é estruturar o conceito e validar a dor através de entrevistas qualitativas.";
      case 'Validação':
        return "Você está validando hipóteses críticas. Otimize seu feedback loop para pivotar ou perseverar com base em dados reais.";
      default:
        return "Sua maturidade operacional está em ascensão. Continue monitorando seus indicadores de tração e eficiência financeira.";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full bg-white/40 backdrop-blur-sm border border-white rounded-[32px] p-6 flex flex-col gap-4 text-slate-800 shadow-sm relative overflow-hidden group hover:bg-white transition-colors duration-500"
    >
      <motion.div 
        animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 p-6 opacity-[0.03] text-indigo-600 pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700"
      >
        <Sparkles size={140} />
      </motion.div>

      <div className="flex items-center gap-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>
        <h3 className="text-[10px] font-display font-black text-slate-400 uppercase tracking-[0.2em]">IA Insight</h3>
      </div>
      
      <p className="text-xs text-slate-600 leading-relaxed font-medium flex-1 relative z-10">
        "{getInsight()}"
      </p>

      <button
        onClick={() => setCurrentView('roadmap')}
        className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-slate-900 to-slate-800 hover:from-indigo-600 hover:to-indigo-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 z-10 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.7)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
        <span className="relative z-10 flex items-center gap-2">
          Continuar Jornada
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </span>
      </button>
    </motion.div>
  );
}
