import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface OperationalAlertCardProps {
  alert: {
    id?: string;
    title: string;
    desc: string;
    type: 'danger' | 'warning' | 'success';
    action: () => void;
    actionLabel: string;
  };
  idx: number;
}

export function OperationalAlertCard({ alert, idx }: OperationalAlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="rounded-[20px] border border-slate-50 bg-white/60 backdrop-blur-sm hover:border-indigo-100 hover:shadow-md transition-all group/alert relative overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px] ${
            alert.type === 'danger' ? 'bg-rose-500 shadow-rose-500/30' : 
            alert.type === 'warning' ? 'bg-amber-400 shadow-amber-400/30' : 
            'bg-emerald-500 shadow-emerald-500/30'
          }`} />
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[200px]">
            {alert.title}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">HÁ POUCO</span>
          <div className="text-slate-400 group-hover/alert:text-indigo-500 transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 flex flex-col gap-2">
              <div className="h-[1px] w-full bg-slate-50 mb-1" />
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                {alert.desc}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert.action();
                }}
                className="mt-1 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-all hover:gap-2 w-fit"
              >
                {alert.actionLabel} <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle hover accent */}
      <div className={`absolute top-0 right-0 w-12 h-12 opacity-0 group-hover/alert:opacity-[0.02] transition-opacity duration-500 rounded-full blur-xl -mr-6 -mt-6 ${
        alert.type === 'danger' ? 'bg-rose-500' : 
        alert.type === 'warning' ? 'bg-amber-400' : 
        'bg-emerald-500'
      }`} />
    </motion.div>
  );
}
