import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import { BarChart3, Activity } from 'lucide-react';

export default function ProductAnalytics() {
  const revenueData = [
    { name: 'Cyzor ERP', value: 45000 },
    { name: 'App Vendas', value: 22000 },
    { name: 'Portal RH', value: 12000 },
    { name: 'Analytics', value: 5500 }
  ];

  const deploysData = [
    { name: 'Jan', deploys: 45 },
    { name: 'Fev', deploys: 52 },
    { name: 'Mar', deploys: 48 },
    { name: 'Abr', deploys: 70 },
    { name: 'Mai', deploys: 85 },
    { name: 'Jun', deploys: 128 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue per product */}
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-[#111111]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Receita por Produto</h3>
            <p className="text-xs text-[#64748B] font-medium">Top produtos do mês</p>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#0F172A05" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={100}
                tick={{ fill: '#111111', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#FAFAFA' }}
                contentStyle={{ 
                  backgroundColor: '#111111', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '12px 16px' 
                }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
              />
              <Bar dataKey="value" fill="#111111" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deploys per month */}
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center shrink-0">
            <Activity size={18} className="text-[#111111]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Frequência de Deploys</h3>
            <p className="text-xs text-[#64748B] font-medium">Evolução dos últimos 6 meses</p>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={deploysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDeploys" x1="0" y1="0" x2="0" y2="1">
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111111', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: '#0F172A15', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="deploys" 
                stroke="#111111" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDeploys)" 
                activeDot={{ r: 6, fill: '#111111', stroke: '#fff', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
