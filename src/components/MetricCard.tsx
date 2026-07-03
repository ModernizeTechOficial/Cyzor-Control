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
      whileHover={{ y: -3, scale: 1.005 }}
      onClick={onClick}
      className={`bg-white border border-[#0F172A08] rounded-[20px] p-4 flex flex-col gap-3.5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all hover:shadow-[0_12px_30px_rgb(0,0,0,0.025)] group relative overflow-hidden text-left h-full ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Premium subtle light effect at top of card on hover */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Background radial soft gradient */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-bl from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />

      {/* Header: Icon & Sparkline */}
      <div className="flex justify-between items-center relative z-10">
        <div className={`w-8.5 h-8.5 rounded-xl bg-[#F8FAFC] border border-[#0F172A08] flex items-center justify-center group-hover:scale-105 group-hover:bg-white group-hover:shadow-sm transition-all duration-500`}>
          <Icon size={14} className={color || 'text-[#111111]'} strokeWidth={1.5} />
        </div>

        {/* Dynamic Sparkline rendering: recharts or custom SVG */}
        {sparkData && sparkData.length > 0 && (
          <div className="h-6 w-16 opacity-30 group-hover:opacity-100 transition-all duration-700">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#111111"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!sparkData && sparklinePath && (
          <div className="w-14 h-6 flex items-center justify-center overflow-hidden opacity-30 group-hover:opacity-100 transition-opacity duration-500">
            <svg className="w-full h-full text-slate-300 group-hover:text-[#111111] transition-colors" viewBox="0 0 80 20" fill="none">
              <path
                d={sparklinePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Main Content: Title, Value and Trend */}
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.15em] leading-none">
          {displayTitle}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-2xl font-display font-bold text-[#111111] tracking-tighter leading-none">
            {value}
          </span>

          {trendObj && (
            <motion.div
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-tighter shrink-0 ${
                trendObj.type === 'up'
                  ? 'text-green-600 bg-green-50/50'
                  : trendObj.type === 'down'
                  ? 'text-red-600 bg-red-50/50'
                  : 'text-[#64748B] bg-[#F8FAFC]'
              }`}
            >
              {trendObj.type === 'up' && <TrendingUp size={8} strokeWidth={3} />}
              {trendObj.type === 'down' && <TrendingDown size={8} strokeWidth={3} />}
              {trendObj.type === 'neutral' && <Minus size={8} strokeWidth={3} />}
              {trendObj.value}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer / Context Text */}
      {displaySub && (
        <div className="flex flex-col gap-1 pt-2 border-t border-[#0F172A05] relative z-10 mt-auto">
          <span className="text-[10px] font-bold text-[#64748B] tracking-tight leading-normal opacity-85 group-hover:opacity-100 transition-opacity truncate">
            {trendObj?.label && trendObj.label !== trendObj.value && (
              <span className="text-[#111111] font-extrabold">{trendObj.label} </span>
            )}
            {displaySub}
          </span>
        </div>
      )}
    </motion.div>
  );
}
