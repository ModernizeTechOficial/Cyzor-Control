import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomeAnalytics({ financeEntries = [] }: { financeEntries?: any[] }) {
  const [viewMode, setViewMode] = useState<'mensal' | 'anual'>('anual');

  // Define months and baseline revenues based on viewMode
  const months = viewMode === 'mensal'
    ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const baselineRevenues = viewMode === 'mensal'
    ? [42000, 48000, 62000, 58000, 75000, 84500]
    : [42000, 48000, 62000, 58000, 75000, 84500, 92000, 88000, 95000, 105000, 112000, 125000];

  const paidRevenues = financeEntries.filter(f => f.type === 'RECEITA');
  const monthlyTotals: Record<string, number> = {};

  // Initialize all months to 0 so there are no mock/baseline fallback values
  months.forEach(m => {
    monthlyTotals[m] = 0;
  });

  if (paidRevenues.length > 0) {
    paidRevenues.forEach(entry => {
      const date = new Date(entry.date);
      const monthIndex = date.getMonth(); // 0-11
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mName = monthNames[monthIndex];
      if (months.includes(mName)) {
        monthlyTotals[mName] = (monthlyTotals[mName] || 0) + Number(entry.amount || 0);
      }
    });
  }

  // Map values combining data
  const data = months.map((m) => {
    const val = monthlyTotals[m] || 0;
    return {
      name: m,
      receita: val,
      projetado: Math.round(val * 0.95)
    };
  });

  // Calculate total depending on selection
  const totalRevenue = Object.values(monthlyTotals).reduce((sum, v) => sum + v, 0);
  const displayTotalStr = `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
              <span className="text-2xl font-bold text-[#111111] tracking-tight">{displayTotalStr}</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> {viewMode === 'anual' ? '+14.2% este ano' : '+12.4% este mês'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-[#0F172A03] p-1.5 rounded-xl">
            <button 
              onClick={() => setViewMode('mensal')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'mensal' ? 'text-[#111111] bg-white shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setViewMode('anual')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'anual' ? 'text-[#111111] bg-white shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              Anual
            </button>
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
                tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`}
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
