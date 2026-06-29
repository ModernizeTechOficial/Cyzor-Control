import { motion } from "motion/react";
import { Sparkles, ArrowRight, AlertCircle, TrendingUp } from "lucide-react";

export default function HomeHero() {
  return (
    <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#0F172A08] rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
    >
        <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-[#111111] flex items-center justify-center flex-shrink-0">
                <Sparkles size={28} className="text-white" />
            </div>
            <div className="flex-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Análise da IA</span>
                <h2 className="text-2xl font-bold text-[#111111] mt-1">Otimização de Performance Detectada</h2>
                <p className="text-[#64748B] mt-2 max-w-2xl">
                    O módulo de vendas apresenta latência 15% superior à média. Recomendamos a atualização do cache em Redis para mitigar o problema.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-red-50 rounded-2xl">
                        <span className="text-xs font-bold text-red-600 uppercase flex items-center gap-2"><AlertCircle size={14} />Problema Crítico</span>
                        <p className="text-sm font-medium mt-1">Latência alta no módulo de vendas.</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl">
                        <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-2"><TrendingUp size={14} />Oportunidade</span>
                        <p className="text-sm font-medium mt-1">Refatoração para redução de custos.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <button className="px-6 py-3 bg-[#111111] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black transition-all">
                        Resolver <ArrowRight size={14} />
                    </button>
                    <button className="px-6 py-3 bg-white border border-slate-200 text-[#111111] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all">
                        Ver detalhes
                    </button>
                </div>
            </div>
        </div>
    </motion.section>
  );
}
