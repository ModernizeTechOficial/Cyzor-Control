import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  bg?: string;
  sparklinePath?: string;
  onClick?: () => void;
}

export default function MetricCard({ 
  title, 
  value, 
  sub, 
  icon: Icon, 
  trend, 
  trendUp = true, 
  color = 'text-[#111111]', 
  bg = 'bg-slate-100/60',
  sparklinePath,
  onClick
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={`bg-white border border-[#0F172A08] rounded-[24px] p-6 flex flex-col justify-between min-h-[160px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all group relative overflow-hidden text-left ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Subtle Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FAFAFA] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-[100px]" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${bg} border border-[#0F172A05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={22} className={color} />
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}

        {!trend && sparklinePath && (
          <div className="w-16 h-8 flex items-center justify-center overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
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
      
      <div className="mt-6 relative z-10">
        <h3 className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display font-bold text-[#111111] tracking-tight">{value}</span>
        </div>
        {sub && <p className="text-[#64748B] text-[13px] font-medium mt-2">{sub}</p>}
      </div>
    </motion.div>
  );
}

