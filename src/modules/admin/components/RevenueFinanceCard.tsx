import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { CreditCard, Wallet, TrendingUp, AlertTriangle, ArrowUpRight, Percent, RefreshCcw } from 'lucide-react';
import Sparkline from './Sparkline.tsx';

export default function RevenueFinanceCard() {
  const chartData = [
    { name: 'Jan', revenue: 72000, expenses: 22000, profit: 50000 },
    { name: 'Fev', revenue: 84000, expenses: 24000, profit: 60000 },
    { name: 'Mar', revenue: 95000, expenses: 26000, profit: 69000 },
    { name: 'Abr', revenue: 110000, expenses: 28000, profit: 82000 },
    { name: 'Mai', revenue: 125000, expenses: 29000, profit: 96000 },
    { name: 'Jun', revenue: 145000, expenses: 31000, profit: 114000 }
  ];

  const financialKPIs = [
    { label: 'MRR (Recorrência Mensal)', value: 'R$ 145.000,00', icon: TrendingUp, trend: '+14.2%', spark: [100, 110, 115, 120, 132, 145], color: '#6366F1' },
    { label: 'ARR (Anual Projetado)', value: 'R$ 1.740.000,00', icon: Wallet, trend: '+18.7%', spark: [1200, 1300, 1400, 1500, 1620, 1740], color: '#06B6D4' },
    { label: 'Stripe Balance (Disponível)', value: 'R$ 48.250,12', icon: CreditCard, trend: 'Sincronizado', spark: [30, 45, 38, 52, 41, 48], color: '#10B981' },
    { label: 'Pending Payouts', value: 'R$ 12.400,00', icon: CreditCard, trend: 'Próx. 48h', spark: [15, 10, 18, 11, 14, 12], color: '#F59E0B' },
    { label: 'Lifetime Value (LTV)', value: 'R$ 6.200,00', icon: TrendingUp, trend: '+4.1%', spark: [5500, 5700, 5800, 5900, 6100, 6200], color: '#EC4899' },
    { label: 'CAC (Custo de Aquisição)', value: 'R$ 450,00', icon: Percent, trend: '-8.3%', spark: [520, 490, 470, 460, 455, 450], color: '#8B5CF6' },
    { label: 'SaaS Churn Rate', value: '1.8%', icon: AlertTriangle, trend: 'Mínimo histórico', spark: [2.5, 2.3, 2.1, 1.9, 1.8, 1.8], color: '#10B981' },
    { label: 'Cash Flow Operacional', value: '94.2%', icon: TrendingUp, trend: 'Otimizado', spark: [90, 92, 91, 93, 93, 94.2], color: '#6366F1' }
  ];

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      
      {/* Title block */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-1.5">
            <CreditCard size={14} className="text-zinc-600" />
            Consolidação Financeira & Stripe Ledger
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Controle de receitas recursivas, perdas e fluxo de caixa da plataforma</p>
        </div>
        <span className="text-[8px] font-mono font-bold bg-zinc-950 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Stripe Connected
        </span>
      </div>

      {/* Grid of Micro KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {financialKPIs.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="p-4 bg-zinc-50/50 border border-[#ECECEF] rounded-2xl hover:bg-white hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col justify-between h-28 group relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">
                  {kpi.label}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                  {kpi.trend}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 mt-2">
                <h4 className="text-lg font-extrabold text-zinc-950 tracking-tight leading-none">
                  {kpi.value}
                </h4>
                <div className="h-6 opacity-75 group-hover:opacity-100 transition-opacity">
                  <Sparkline data={kpi.spark} color={kpi.color} width={60} height={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Main Chart */}
      <div className="border border-[#ECECEF] p-4 rounded-2xl bg-zinc-50/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Histórico de Cash Flow (Semestre)</span>
            <span className="text-xs text-zinc-500 font-sans">Receita Bruta vs Custos de Infraestrutura AWS/GCP</span>
          </div>
          <div className="flex gap-4 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" /> Faturamento
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" /> Despesas Cloud
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpensesLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#A1A1AA" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#A1A1AA" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#18181b', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                formatter={(val) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
              />
              <Area type="monotone" dataKey="revenue" name="Receita" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenueLight)" />
              <Area type="monotone" dataKey="expenses" name="Despesa" stroke="#ec4899" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExpensesLight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
