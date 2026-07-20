import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface TrendObject {
  value: string;
  type: 'up' | 'down' | 'neutral';
  label?: string;
}

interface MetricCardProps {
  title?: string;
  label?: string; // fallback/alias
  value: string | number;
  sub?: string;
  contextText?: string; // fallback/alias
  icon: React.ElementType;
  trend?: string | TrendObject;
  trendUp?: boolean; // fallback for string-based trends
  color?: string;
  bg?: string;
  sparklinePath?: string;
  sparkData?: { value: number }[];
  onClick?: () => void;
}

export default function MetricCard({
  title,
  label,
  value,
  sub,
  contextText,
  icon: Icon,
  trend,
  trendUp = true,
  color,
  bg,
  sparklinePath,
  sparkData,
  onClick
}: MetricCardProps) {
  const displayTitle = title || label || '';
  const displaySub = sub || contextText || '';

  // Parse trend prop to standard format
  let trendObj: TrendObject | null = null;
  if (trend) {
    if (typeof trend === 'string') {
      trendObj = {
        value: trend,
        type: trendUp ? 'up' : 'down',
        label: trend
      };
    } else {
      trendObj = trend;
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-4 rounded-[28px] bg-white/60 backdrop-blur-md border border-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Decorative ambient background accent */}
      <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-50/30 rounded-full opacity-40 group-hover:bg-indigo-50/50 transition-colors duration-500" />
      
      {/* Header: Icon & Sparkline */}
      <div className="flex justify-between items-center relative z-10 mb-1.5">
        <div className={`p-1.5 rounded-lg ${color || 'text-indigo-600 bg-indigo-50'} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={12} strokeWidth={2.5} />
        </div>

        {!sparkData && sparklinePath && (
          <div className="w-12 h-5 flex items-center justify-center overflow-hidden opacity-30 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-full h-full text-slate-300 group-hover:text-indigo-600 transition-colors" viewBox="0 0 80 20" fill="none">
              <path
                d={sparklinePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Trend indicator (Floating) */}
      {trendObj && (
        <div className="mb-1.5 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -2 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest shrink-0 uppercase ${
              trendObj.type === 'up'
                ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                : trendObj.type === 'down'
                ? 'text-rose-600 bg-rose-50 border border-rose-100'
                : 'text-slate-500 bg-slate-50 border border-slate-100'
            }`}
          >
            {trendObj.type === 'up' && <TrendingUp size={9} strokeWidth={3} />}
            {trendObj.type === 'down' && <TrendingDown size={9} strokeWidth={3} />}
            {trendObj.type === 'neutral' && <Minus size={9} strokeWidth={3} />}
            {trendObj.value}
          </motion.div>
        </div>
      )}

      {/* Main Content: Title, Value */}
      <div className="flex flex-col gap-0.5 relative z-10">
        <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.15em] leading-none mb-1 opacity-70">
          {displayTitle}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-display font-black text-[#0F172A] tracking-tight leading-none">
            {value}
          </span>
          {displaySub && (
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[70px]">
              {displaySub.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
