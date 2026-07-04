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
        return "Sua empresa está em fase inicial. O foco agora é estruturar o conceito e validar a dor.";
      case 'Validação':
        return "Você está validando hipóteses. Certifique-se de ouvir seus potenciais clientes com atenção.";
      default:
        return "Sua empresa está evoluindo bem. Continue monitorando seus indicadores e focando nos próximos marcos.";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-slate-900 border border-slate-800 rounded-[24px] p-6 flex flex-col gap-4 text-white shadow-xl"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold text-white">Business Insight</h3>
      </div>
      
      <p className="text-xs text-slate-300 leading-relaxed">
        {getInsight()}
      </p>

      <button
        onClick={() => setCurrentView('roadmap')}
        className="self-start text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
      >
        Continuar Jornada
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
