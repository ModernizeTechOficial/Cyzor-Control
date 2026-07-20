import React from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Target, CheckCircle2, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { MaturityGauge } from './MaturityGauge';
import { Tooltip } from '../ui/Tooltip';
import { useTooltip } from '../ui/useTooltip';

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
  const buttonTooltip = useTooltip();
  const gaugeTooltip = useTooltip();
  return (
    <div className="relative group bg-white/40 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
            <h2 className="text-2xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 tracking-tight leading-none">Maturidade Operacional</h2>
          </div>
        </div>

          <Tooltip
            open={buttonTooltip.open}
            anchorRef={buttonTooltip.anchorRef}
            title="VisÃ£o EstratÃ©gica"
            description="Clique para abrir o roadmap completo da sua jornada."
          >
            <button
              ref={buttonTooltip.anchorRef}
              onClick={onRoadmapClick}
              className="relative overflow-hidden group/btn bg-gradient-to-r from-slate-900 to-slate-800 hover:from-indigo-600 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
          <span className="relative z-10 flex items-center gap-1">
            Ver Roadmap <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
          </span>
        </button>
        </Tooltip>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row relative z-10">
        
        {/* Left Side: Gauge */}
        <div className="lg:w-5/12 p-6 lg:border-r border-slate-100 flex flex-col items-center justify-center bg-white relative">
          <div className="text-center mb-6">
            <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[8px] font-black uppercase tracking-widest rounded-md mb-2">
              EstÃ¡gio Ativo
            </span>
            <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none mb-1">
              {currentStage.label}
            </h3>
          </div>

          <Tooltip
            open={gaugeTooltip.open}
            anchorRef={gaugeTooltip.anchorRef}
            title="Indicador de Maturidade"
            description="Mostra o percentual de progresso e o nÃ­vel atual."
          >
            <MaturityGauge progress={progress} score={besScore} level={Math.floor(besScore / 100)} />
          </Tooltip>
        </div>

        {/* Right Side: Next Goal & Actions */}
        <div className="flex-1 p-6 bg-slate-50/30 flex flex-col justify-center">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={14} className="text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PrÃ³ximo Marco</span>
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
          { label: 'AtenÃ§Ã£o', val: 'NecessÃ¡ria maior traÃ§Ã£o.', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'ProjeÃ§Ã£o', val: 'MVP alcanÃ§Ã¡vel.', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' }
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

