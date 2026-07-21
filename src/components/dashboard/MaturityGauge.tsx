import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface MaturityGaugeProps {
  progress: number;
  score: number;
  level: number;
}

export function MaturityGauge({ progress, score, level }: MaturityGaugeProps) {
  const size = 160;
  const stroke = 10;
  const normalizedRadius = (size / 2) - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatus = () => {
    if (progress < 25) return { title: "Inicial", color: "#ef4444" };
    if (progress < 50) return { title: "Crescimento", color: "#f59e0b" };
    if (progress < 75) return { title: "Consolidada", color: "#3b82f6" };
    return { title: "Alta Performance", color: "#10b981" };
  };

  const status = getStatus();

  // Animated numeric progress value
  const progressMotion = useMotionValue(0);
  const animatedProgress = useSpring(progressMotion, { damping: 20, stiffness: 150 });
  const displayProgress = useTransform(animatedProgress, (v) => Math.round(v));

  // Update motion value when progress prop changes
  React.useEffect(() => {
    progressMotion.set(progress);
  }, [progress, progressMotion]);

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{ background: status.color }}
        />

        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="cyzorGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={status.color} />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={normalizedRadius} fill="transparent" stroke="#f1f5f9" strokeWidth={stroke} />
          <motion.circle cx={size/2} cy={size/2} r={normalizedRadius} fill="transparent" stroke="url(#cyzorGradientSmall)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference} animate={{ strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }} />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          {/* Rotating halo */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${status.color}` }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
          <motion.div
            className="text-3xl font-black tracking-tight text-slate-900"
            style={{ color: status.color }}
          >
            {Math.round(displayProgress.get())}%
          </motion.div>
          <div className="mt-1 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest" style={{ background: `${status.color}15`, color: status.color }}>
            Nível {level}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 w-full justify-center">
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Score de Evolução</div>
          <div className="text-base font-black text-slate-900">{score}</div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</div>
          <div className="text-xs font-black mt-0.5" style={{ color: status.color }}>{status.title}</div>
        </div>
      </div>
    </div>
  );
}