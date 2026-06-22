import { useState, useEffect, useMemo } from 'react';
import MetricCard from './MetricCard';
import FinanceEntryModal from './FinanceEntryModal';
import { useAuth } from '../context/AuthContext';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Server, Globe, Key, Database, MoreHorizontal, Edit3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#111111', '#475569', '#94A3B8', '#CBD5E1', '#E2E8F0'];

export default function FinanceiroView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const [entries, setEntries] = useState<any[]>([]);
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  const fetchFinance = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await fetchWithAuth('/api/finance');
      if (res.ok) {
        const data = await res.json();
        setEntries(data || []);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [activeWorkspace]);

  const handleEditClick = (entry: any) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  // Derived calculations
  const {
    revenueMensal,
    revenueAnual,
    custoMensal,
    lucroEstimado,
    chartRevenueData,
    companyData,
    tableData
  } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let rMensal = 0;
    let rAnual = 0;
    let cMensal = 0;
    
    // Revenue array by month for chart (0-11)
    const monthlyRevenue = Array(12).fill(0);
    const companyRevenue: Record<string, number> = {};

    entries.forEach((e: any) => {
      const d = new Date(e.date || Date.now());
      const amount = Number(e.amount) || 0;
      
      if (e.type === 'RECEITA') {
        if (d.getFullYear() === currentYear) {
          rAnual += amount;
          monthlyRevenue[d.getMonth()] += amount;
        }
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          rMensal += amount;
        }
        
        // Group by company
        const comp = e.company || 'Outros';
        companyRevenue[comp] = (companyRevenue[comp] || 0) + amount;
      } else {
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          cMensal += amount;
        }
      }
    });

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const chartRev = monthNames.map((name, i) => ({
      name,
      value: monthlyRevenue[i]
    })).slice(0, currentMonth + 1); // Only show up to current month

    const compData = Object.entries(companyRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // Calculate percentages for company pie chart
    const totalCompanyRevenue = compData.reduce((acc, curr) => acc + curr.value, 0);
    const companyDataWithPercentage = compData.map(c => ({
      ...c,
      percentage: totalCompanyRevenue > 0 ? Math.round((c.value / totalCompanyRevenue) * 100) : 0
    }));

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date || Date.now()).getTime() - new Date(a.date || Date.now()).getTime());

    return {
      revenueMensal: rMensal,
      revenueAnual: rAnual,
      custoMensal: cMensal,
      lucroEstimado: rMensal - cMensal,
      chartRevenueData: chartRev.length > 0 ? chartRev : [{ name: monthNames[currentMonth], value: 0 }],
      companyData: companyDataWithPercentage,
      tableData: sortedEntries
    };
  }, [entries]);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <section className="relative flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">Financeiro</h1>
          <p className="text-[#64748B] text-lg font-medium tracking-wide">Saúde financeira, receitas e custos de infraestrutura.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#FFFFFF] text-[#111111] px-5 py-3 rounded-[14px] font-bold text-sm tracking-wide border border-[#0F172A0F] hover:bg-[#FAFAFA] transition-all">
            Exportar Relatório
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#111111] text-white px-6 py-3 rounded-[14px] font-bold text-sm tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black transition-all">
            Novo Lançamento
          </button>
        </div>
      </section>
      
      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Receita Mensal" value={formatCurrency(revenueMensal)} sub="Este mês" icon={DollarSign} />
        <MetricCard title="Receita Anual" value={formatCurrency(revenueAnual)} sub={`Ano Atual (${new Date().getFullYear()})`} icon={TrendingUp} />
        <MetricCard title="Custos Mensais" value={formatCurrency(custoMensal)} sub="Infraestrutura, APIs, etc." icon={CreditCard} />
        <MetricCard title="Lucro Estimado" value={formatCurrency(lucroEstimado)} sub="Mês atual" icon={ArrowUpRight} />
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Receita por Mês - Chart */}
        <div className="xl:col-span-2 bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase text-[#64748B] tracking-widest">Fluxo de Caixa (Receita Mês a Mês)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <RechartsTooltip 
                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #0F172A0F', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Area type="monotone" dataKey="value" stroke="#111111" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Empresa - Chart */}
        <div className="bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase text-[#64748B] tracking-widest">Receitas por Empresa</h3>
          {companyData.length > 0 ? (
            <>
              <div className="h-[250px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={companyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {companyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #0F172A0F' }} formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-[#111111]">100%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                {companyData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-medium text-[#475569]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#111111]">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-sm text-[#64748B]">Nenhuma receita registrada.</div>
          )}
        </div>
      </section>

      {/* Transactions Table */}
      <section className="bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-[#0F172A0F] flex justify-between items-center bg-[#FAFAFA]">
          <h3 className="text-sm font-bold uppercase text-[#64748B] tracking-widest">Últimas Transações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0F172A0F]">
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#94A3B8] tracking-wider whitespace-nowrap">Data</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#94A3B8] tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#94A3B8] tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#94A3B8] tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-[#94A3B8] tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? tableData.map((row) => {
                const isPositive = row.type === 'RECEITA';
                return (
                  <tr 
                    key={row.id} 
                    className="border-b border-[#0F172A0F] last:border-0 hover:bg-[#FAFAFA]/50 transition-colors group cursor-pointer"
                    onClick={() => handleEditClick(row)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#64748B] whitespace-nowrap">
                      {new Date(row.date || Date.now()).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111111]">
                      <div className="flex items-center gap-2">
                        {row.description}
                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[#E2E8F0] text-[#64748B] transition-all">
                           <Edit3 size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 bg-[#F1F5F9] text-[#64748B] rounded-md">{row.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#475569]">{row.company || '-'}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right flex justify-end items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {formatCurrency(Number(row.amount))}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-[#64748B]">Nenhuma transação financeira encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <FinanceEntryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEntry(null); }} 
        onSuccess={fetchFinance} 
        entry={editingEntry}
      />
    </div>
  );
}

function ExpenseCard({ title, value, sub, icon: Icon }: { title: string, value: string, sub: string, icon: any }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 flex flex-col items-center justify-center text-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#64748B] mb-2">
        <Icon size={20} />
      </div>
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{title}</h4>
      <span className="text-2xl font-bold text-[#111111]">{value}</span>
      <span className="text-xs text-[#94A3B8] font-medium">{sub}</span>
    </div>
  );
}
