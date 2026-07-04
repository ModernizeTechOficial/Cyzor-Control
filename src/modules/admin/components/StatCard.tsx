import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Circle } from 'lucide-react';
import Sparkline from './Sparkline.tsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
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

  // Split value into number and suffix if needed
  const displayValue = typeof value === 'string' ? value.split(' ')[0] : value;
  const suffix = typeof value === 'string' && value.includes(' ') ? value.substring(value.indexOf(' ') + 1) : '';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-36">
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block font-sans mb-3">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
              {displayValue}
            </h3>
            {suffix && (
               <span className="text-xs text-gray-400 font-medium">{suffix}</span>
            )}
          </div>
        </div>

        {/* Sparkline visualization */}
        {sparkData && sparkData.length > 0 && (
          <div className="h-10 shrink-0 pt-2 flex items-center justify-center">
            <Sparkline data={sparkData} width={50} height={28} />
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3 mt-4">
        <div className="h-px bg-gray-100 w-full" />
        <div className="flex justify-between items-center">
           <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
           </div>
           {trend && (
            <span className="text-[10px] font-bold text-emerald-500">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
