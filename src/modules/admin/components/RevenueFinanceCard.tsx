import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { ChevronDown } from 'lucide-react';

export default function RevenueFinanceCard({ metrics }: { metrics?: any }) {
  // Use real data from metrics or fallback to empty array
  const chartData = metrics?.trends?.length > 0 
    ? metrics.trends.map((t: any) => ({
        name: t.month.split('-')[1], // Just show month number or string
        value: t.revenue
      }))
    : [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 }
      ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
          Tendência de Vendas
        </h3>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <span className="text-xs font-medium text-gray-600">Este Ano</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} 
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff', padding: '8px 12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(val) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Receita']}
            />
            <Bar 
              dataKey="value" 
              fill="#111827" 
              radius={[4, 4, 4, 4]} 
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
