import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Sparkline from './Sparkline.tsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  comparisonText?: string;
  sparkData?: number[];
  accentColor?: string;
}

export default function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendDirection = 'up', 
  comparisonText = 'últimos 30 dias',
  sparkData = [10, 15, 8, 12, 19, 14, 25],
  accentColor = '#6366F1'
}: StatCardProps) {
  const isUp = trendDirection === 'up';
  const isDown = trendDirection === 'down';

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-zinc-300 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Visual background ripple effect on hover */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-zinc-50 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 pointer-events-none -z-10" />

      <div className="flex items-center justify-between mb-4">
        {/* Minimalist premium icon */}
        <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-[#ECECEF] flex items-center justify-center text-zinc-800 shrink-0 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 shadow-inner">
          <Icon size={16} />
        </div>

        {/* Small trend badge */}
        {trend && (
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            isUp ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
            isDown ? 'bg-rose-50 text-rose-700 border-rose-100' : 
            'bg-zinc-50 text-zinc-500 border-zinc-100'
          }`}>
            {isUp ? <ArrowUpRight size={10} /> : isDown ? <ArrowDownRight size={10} /> : null}
            {trend}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 mt-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">
            {label}
          </span>
          <h3 className="text-3xl font-extrabold text-zinc-950 tracking-tight leading-none group-hover:scale-[1.01] transition-transform">
            {value}
          </h3>
          <span className="text-[9px] font-medium text-zinc-400 block pt-1">
            {comparisonText}
          </span>
        </div>

        {/* Sparkline visualization */}
        {sparkData && sparkData.length > 0 && (
          <div className="h-9 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">
            <Sparkline data={sparkData} color={accentColor} width={100} height={32} />
          </div>
        )}
      </div>
    </div>
  );
}
