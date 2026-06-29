import { PieChart, TrendingUp, MoreHorizontal, ArrowUpRight } from 'lucide-react';

export default function FinancialSummary() {
  // Mock data for the visual representation
  const mrr = 184500;
  const arr = mrr * 12;
  const growth = 12.5;

  return (
    <div className="bg-[#111111] rounded-[28px] p-6 sm:p-8 shadow-[0_20px_40px_rgb(0,0,0,0.1)] relative overflow-hidden text-white h-fit group">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
          <PieChart size={18} className="text-white/50" />
          Resumo Financeiro
        </h3>
        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">MRR (Receita Recorrente Mensal)</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-display font-bold tracking-tight">
              R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mb-1">
              <TrendingUp size={14} />
              +{growth}%
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-white/10" />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">ARR (Receita Recorrente Anual)</p>
          <span className="text-xl font-display font-semibold tracking-tight text-white/90">
            R$ {arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      
      <button className="w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all relative z-10 flex items-center justify-center gap-2">
        <span>Relatório Completo</span>
        <ArrowUpRight size={14} className="opacity-50" />
      </button>
    </div>
  );
}
