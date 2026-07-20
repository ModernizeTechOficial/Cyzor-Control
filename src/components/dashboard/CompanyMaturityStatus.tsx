import React from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Target, CheckCircle2, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { MaturityGauge } from './MaturityGauge';

interface CompanyMaturityStatusProps {
  progress: number;
  besScore: number;
  currentStage: { label: string; role: string };
  nextStage?: { label: string };
  pointsToNext: number;
  recommendations: any[];
  onRoadmapClick: () => void;
}

export function CompanyMaturityStatus({
  progress,
  besScore,
  currentStage,
  nextStage,
  pointsToNext,
  recommendations,
  onRoadmapClick
}: CompanyMaturityStatusProps) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative w-full">
      {/* HEADER */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
            <Zap size={18} className="text-indigo-400 fill-indigo-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Cyzor Control</span>
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest leading-none">Executivo</span>
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 tracking-tight leading-none">
              Maturidade Operacional
            </h2>
          </div>
        </div>

        <button 
          onClick={onRoadmapClick}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors flex items-center gap-1.5 shadow-sm group"
        >
          Ver Roadmap <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row relative z-10">
        
        {/* Left Side: Gauge */}
        <div className="lg:w-5/12 p-6 lg:border-r border-slate-100 flex flex-col items-center justify-center bg-white relative">
          <div className="text-center mb-6">
            <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[8px] font-black uppercase tracking-widest rounded-md mb-2">
              Estágio Ativo
            </span>
            <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none mb-1">
              {currentStage.label}
            </h3>
          </div>

          <MaturityGauge progress={progress} score={besScore} level={Math.floor(besScore / 100)} />
        </div>

        {/* Right Side: Next Goal & Actions */}
        <div className="flex-1 p-6 bg-slate-50/30 flex flex-col justify-center">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={14} className="text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Próximo Marco</span>
              </div>
              <h4 className="text-xl font-display font-black text-slate-900">
                Desbloquear <span className="text-indigo-600 uppercase">{nextStage?.label || 'MVP'}</span>
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Faltam</span>
              <span className="text-base font-black text-slate-700">{pointsToNext.toLocaleString()} BES</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {recommendations.slice(0, 3).map((rec: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                key={idx} 
                className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                  <CheckCircle2 size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900 truncate">{rec.title}</p>
                </div>
                <div className="shrink-0">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">+{rec.impact} BES</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-t border-slate-100 bg-white">
        {[
          { label: 'Panorama', val: 'Capacidade validada.', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Atenção', val: 'Necessária maior tração.', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Projeção', val: 'MVP alcançável.', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' }
        ].map((item, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
            <div className={`w-6 h-6 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon size={12} className={item.color} />
            </div>
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{item.label}</span>
              <p className="text-[10px] font-bold text-slate-700 leading-none mt-0.5">{item.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
