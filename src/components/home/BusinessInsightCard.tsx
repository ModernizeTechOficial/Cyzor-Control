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
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-600 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Sparkles size={120} />
      </div>

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
        className="w-full py-3.5 bg-[#0F172A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 relative z-10 shadow-xl shadow-indigo-900/10"
      >
        Continuar Jornada
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
