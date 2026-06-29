import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export default function IdeaCharts() {
  const statusData = [
    { name: 'Capturadas', value: 24, color: '#94a3b8' },
    { name: 'Em Avaliação', value: 12, color: '#6366f1' },
    { name: 'Em Pesquisa', value: 8, color: '#3b82f6' },
    { name: 'MVP', value: 5, color: '#a855f7' },
    { name: 'Lançadas', value: 3, color: '#10b981' }
  ];

  const captureData = [
    { name: 'Jan', value: 12 },
    { name: 'Fev', value: 19 },
    { name: 'Mar', value: 15 },
    { name: 'Abr', value: 28 },
    { name: 'Mai', value: 24 },
    { name: 'Jun', value: 35 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Status Distribution */}
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center shrink-0">
            <PieChartIcon size={18} className="text-[#111111]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Distribuição do Funil</h3>
            <p className="text-xs text-[#64748B] font-medium">Ideias por status atual</p>
          </div>
        </div>

        <div className="h-[240px] w-full flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111111', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '8px 12px' 
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 flex flex-col gap-3 pl-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-[#64748B]">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-[#111111]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ideas Captured Over Time */}
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-[#111111]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">Ideias Capturadas</h3>
            <p className="text-xs text-[#64748B] font-medium">Evolução dos últimos 6 meses</p>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={captureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                cursor={{ fill: '#FAFAFA' }}
                contentStyle={{ 
                  backgroundColor: '#111111', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => [value, 'Ideias']}
              />
              <Bar dataKey="value" fill="#111111" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
