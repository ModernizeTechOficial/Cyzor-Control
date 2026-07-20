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
    <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col relative overflow-hidden group">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-50 relative z-10 bg-slate-50/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <Zap size={22} className="text-indigo-400 fill-indigo-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] leading-none">Cyzor Control</span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.3em] leading-none">Executivo</span>
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 tracking-tight leading-none">Maturidade Operacional (BES)</h2>
          </div>
        </div>

        <button 
          onClick={onRoadmapClick}
          className="mt-4 sm:mt-0 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-2 shadow-sm group/btn active:scale-95"
        >
          ROADMAP <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Content Body */}
      <div className="grid grid-cols-12 gap-0 relative z-10">
        {/* Left: Gauge and Status */}
        <div className="col-span-12 lg:col-span-5 p-8 lg:border-r border-slate-50 flex flex-col items-center justify-center bg-white">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">{currentStage.label}</h3>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100/50">ATIVO</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operacionalização</p>
          </div>

          <MaturityGauge 
            progress={progress} 
            score={besScore} 
            level={Math.floor(besScore / 100)} 
          />
        </div>

        {/* Right: Goals & Milestones */}
        <div className="col-span-12 lg:col-span-7 p-8 flex flex-col bg-slate-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
              <Target size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Meta Prioritária</span>
              <h4 className="text-lg font-display font-black text-slate-900 leading-none">Desbloquear: <span className="text-indigo-600 uppercase">{nextStage?.label || 'MVP'}</span></h4>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[28px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
            {/* Action Items */}
            <div className="flex flex-col gap-3 flex-1 w-full relative z-10">
              {recommendations.slice(0, 2).map((rec: any, idx: number) => (
                <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-[18px] p-4 flex items-center gap-4 group/task hover:bg-white hover:border-indigo-200 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{rec.title}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover/task:text-indigo-500 transition-colors">+{rec.impact} BES</p>
                  </div>
                </div>
              ))}
            </div>

            <ArrowRight size={16} className="text-slate-200 hidden md:block" />

            {/* Target Milestone */}
            <div className="bg-slate-900 rounded-[24px] p-6 shadow-xl flex flex-col items-center justify-center text-center gap-3 min-w-[150px] relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{nextStage?.label || 'MVP'}</p>
                <p className="text-[9px] font-bold text-slate-400 leading-tight">Faltam {pointsToNext.toLocaleString()} BES</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Panorama', val: 'Capacidade estável e validada.' },
            { label: 'Atenção', val: 'Necessária maior tração comercial.' },
            { label: 'Projeção', val: 'Estágio MVP alcançável em breve.' }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-center shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'}`} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
              </div>
              <p className="text-[12px] font-bold text-slate-700 leading-snug">{item.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
