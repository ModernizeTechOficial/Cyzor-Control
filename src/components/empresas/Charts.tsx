import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function Charts() {
  const data = [
    { name: 'Jan', revenue: 120000, companies: 98 },
    { name: 'Fev', revenue: 135000, companies: 105 },
    { name: 'Mar', revenue: 142000, companies: 108 },
    { name: 'Abr', revenue: 158000, companies: 112 },
    { name: 'Mai', revenue: 175000, companies: 118 },
    { name: 'Jun', revenue: 184500, companies: 124 },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value}`;
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center">
            <BarChart3 size={18} className="text-[#111111]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Crescimento da Receita</h3>
            <p className="text-xs text-[#64748B] font-medium">Histórico dos últimos 6 meses</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-[#FAFAFA] border border-[#0F172A08] rounded-xl text-xs font-bold uppercase tracking-widest text-[#64748B]">
          <button className="px-4 py-2 rounded-lg bg-white shadow-sm text-[#111111] transition-all">Receita</button>
          <button className="px-4 py-2 rounded-lg hover:text-[#111111] transition-all">Empresas</button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#111111" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0F172A08" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111111', 
                borderRadius: '16px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '12px 16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
              itemStyle={{ color: '#fff' }}
              cursor={{ stroke: '#0F172A15', strokeWidth: 2, strokeDasharray: '4 4' }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#111111" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: '#111111', stroke: '#fff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
