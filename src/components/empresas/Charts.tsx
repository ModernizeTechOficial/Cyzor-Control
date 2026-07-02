import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartsProps {
  finance?: any[];
  companies?: any[];
}

export default function Charts({ finance = [], companies = [] }: ChartsProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'companies'>('revenue');

  const processedData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      last6Months.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        name: monthNames[d.getMonth()],
        revenue: 0,
        companies: 0,
      });
    }

    // Accumulate Revenue
    finance.forEach((entry) => {
      if (entry.type !== 'RECEITA') return;
      const d = new Date(entry.date || entry.createdAt);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const bucket = last6Months.find(b => b.month === m && b.year === y);
      if (bucket) {
        bucket.revenue += Number(entry.amount) || 0;
      }
    });

    // Accumulate Companies (new companies per month)
    companies.forEach((company) => {
      const d = new Date(company.createdAt);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const bucket = last6Months.find(b => b.month === m && b.year === y);
      if (bucket) {
        bucket.companies += 1;
      }
    });

    return last6Months;
  }, [finance, companies]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value}`;
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <BarChart3 size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#111111]">
              {activeTab === 'revenue' ? 'Crescimento da Receita' : 'Novas Empresas'}
            </h3>
            <p className="text-xs text-[#64748B] font-medium">Histórico dos últimos 6 meses</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-[#FAFAFA] border border-[#0F172A08] rounded-xl text-xs font-bold uppercase tracking-widest text-[#64748B]">
          <button 
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'revenue' ? 'bg-white shadow-sm text-indigo-600' : 'hover:text-[#111111]'}`}
          >
            Receita
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'companies' ? 'bg-white shadow-sm text-indigo-600' : 'hover:text-[#111111]'}`}
          >
            Empresas
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
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
              tickFormatter={activeTab === 'revenue' ? formatYAxis : (val) => val}
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
              cursor={{ stroke: '#4F46E525', strokeWidth: 2, strokeDasharray: '4 4' }}
              formatter={(value: number) => [
                activeTab === 'revenue' ? formatCurrency(value) : `${value} empresas`, 
                activeTab === 'revenue' ? 'Receita' : 'Empresas'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey={activeTab === 'revenue' ? 'revenue' : 'companies'} 
              stroke="#4F46E5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
