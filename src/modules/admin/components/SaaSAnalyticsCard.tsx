import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { MoreHorizontal, Sparkles } from 'lucide-react';

export default function SaaSAnalyticsCard({ metrics }: { metrics?: any }) {
  const chartData = [
    { name: 'Tenants', value: metrics?.totalTenants || 1 },
    { name: 'Usuários', value: metrics?.totalUsers || 1 },
    { name: 'Projetos', value: metrics?.totalProjects || 1 },
  ];

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const COLORS = ['#111827', '#6b7280', '#e5e7eb'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
          Distribuição da Plataforma
        </h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex-1 w-full flex items-center justify-center min-h-[160px]">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff', padding: '8px 12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(val: number) => [`${Math.round((val / total) * 100)}%`, 'Share']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between px-2 text-xs font-medium text-gray-600 mt-2 mb-6">
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-gray-900" />
           <span>Tenants</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-gray-500" />
           <span>Usuários</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-gray-200" />
           <span>Projetos</span>
         </div>
      </div>

      <div className="mt-auto">
        <div className="bg-[#f0f3ff] border border-[#d6e0ff] rounded-xl p-4 flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
             <Sparkles size={16} className="text-white" />
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-semibold text-gray-900">Get AI insight for better analysis</span>
             <span className="text-[10px] text-gray-500 font-medium">Available in Pro plan</span>
           </div>
        </div>
      </div>

    </div>
  );
}
