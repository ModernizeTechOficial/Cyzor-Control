import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomeAnalytics() {
  const data = [
    { name: 'Jan', receita: 42000, projetado: 40000 },
    { name: 'Fev', receita: 48000, projetado: 46000 },
    { name: 'Mar', receita: 62000, projetado: 58000 },
    { name: 'Abr', receita: 58000, projetado: 64000 },
    { name: 'Mai', receita: 75000, projetado: 72000 },
    { name: 'Jun', receita: 84500, projetado: 80000 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Receita {payload[0].payload.name}</span>
          <span className="text-sm font-bold">R$ {payload[0].value.toLocaleString('pt-BR')}</span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight size={10} /> +18.4% vs projetado
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between h-full min-h-[380px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Performance Financeira</h4>
            <div className="flex items-baseline gap-2.5 mt-1.5">
              <span className="text-2xl font-bold text-[#111111] tracking-tight">R$ 84.500,00</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> +12.4% este mês
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-[#0F172A03] p-1.5 rounded-xl">
            <button className="text-[10px] font-bold text-[#111111] bg-white px-2.5 py-1 rounded-lg shadow-sm">Mensal</button>
            <button className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] px-2.5 py-1 rounded-lg transition-colors">Anual</button>
          </div>
        </div>

        <div className="h-[240px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceitaReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                tickFormatter={(value) => `R$ ${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorReceitaReal)" 
                strokeWidth={2.5} 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#1d4ed8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
