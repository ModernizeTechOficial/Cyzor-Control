import { useState, useEffect, useMemo } from 'react';
import MetricCard from './MetricCard';
import StandardHeader from './layout/StandardHeader';
import FinanceEntryModal from './FinanceEntryModal';
import { useAuth } from '../context/AuthContext';
import { useFinance, useProjects, useCompanies } from '../hooks/useCyzorQueries';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, Server, Globe, Key, Database, MoreHorizontal, Edit3, Layers, ChevronRight, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#111111', '#475569', '#94A3B8', '#CBD5E1', '#E2E8F0'];

export default function FinanceiroView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const { data: financeData, isLoading: isFinanceLoading } = useFinance();
  const { data: projectsData } = useProjects();
  const { data: companiesData } = useCompanies();

  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => { if (financeData) setEntries(financeData); }, [financeData]);
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  const fetchData = async () => {
    if (!activeWorkspace) return;
    try {
      const [finRes, projRes] = await Promise.all([
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/projects')
      ]);
      if (finRes.ok) setEntries(await finRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
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
    projetoRevenue,
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
    let pRevenue = 0;
    
    // Project budgets
    projects.forEach(p => {
      pRevenue += Number(p.budget || 0);
    });

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
      projetoRevenue: pRevenue,
      chartRevenueData: chartRev.length > 0 ? chartRev : [{ name: monthNames[currentMonth], value: 0 }],
      companyData: companyDataWithPercentage,
      tableData: sortedEntries
    };
  }, [entries, projects]);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
      <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative text-left px-4 sm:px-6 lg:px-10">
        <StandardHeader 
          title="Financeiro"
          subtitle="Saúde financeira, receitas e custos de infraestrutura do ecossistema."
          actions={[
            {
              label: 'Exportar',
              onClick: () => {},
              variant: 'secondary'
            },
            {
              label: 'Novo Lançamento',
              icon: Plus,
              onClick: () => setIsModalOpen(true),
              variant: 'primary'
            }
          ]}
        />
      
      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <MetricCard 
          title="Receita Mensal" 
          value={formatCurrency(revenueMensal)} 
          sub="Lançamentos pagos" 
          icon={DollarSign} 
          trend="+12%" 
          trendUp={true}
          bg="bg-emerald-50/50"
          color="text-emerald-600"
        />
        <MetricCard 
          title="Receita Anual" 
          value={formatCurrency(revenueAnual)} 
          sub={`Ano Atual (${new Date().getFullYear()})`} 
          icon={TrendingUp} 
          trend="+8%" 
          trendUp={true}
          bg="bg-indigo-50/50"
          color="text-indigo-600"
        />
        <MetricCard 
          title="Custos Mensais" 
          value={formatCurrency(custoMensal)} 
          sub="Infraestrutura, APIs, etc." 
          icon={CreditCard} 
          trend="-2%" 
          trendUp={false}
          bg="bg-rose-50/50"
          color="text-rose-600"
        />
        <MetricCard 
          title="Pipeline Projetos" 
          value={formatCurrency(projetoRevenue)} 
          sub="Receita em andamento" 
          icon={Layers} 
          bg="bg-slate-100/60"
          color="text-slate-600"
        />
        <MetricCard 
          title="Lucro Líquido" 
          value={formatCurrency(lucroEstimado)} 
          sub="Mês atual" 
          icon={ArrowUpRight} 
          trend="+15%" 
          trendUp={true}
          bg="bg-blue-50/50"
          color="text-blue-600"
        />
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Receita por Mês - Chart */}
        <div className="xl:col-span-2 bg-white rounded-[24px] border border-[#0F172A08] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-widest">Fluxo de Caixa (Receita Mês a Mês)</h3>
          </div>
          <div className="h-[350px] w-full">
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
        <div className="bg-white rounded-[24px] border border-[#0F172A08] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6 sm:p-8 flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-widest">Receitas por Empresa</h3>
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
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #0F172A0F', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }} 
                      formatter={(value: any) => formatCurrency(Number(value))} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#111111]">100%</span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Total</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-auto">
                {companyData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-xs group cursor-default">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="font-bold text-[#475569] group-hover:text-[#111111] transition-colors">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#111111]">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-xs font-medium text-[#64748B]">Nenhuma receita registrada.</div>
          )}
        </div>
      </section>

      {/* Transactions Table */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-[#111111] flex items-center gap-2">
            <CreditCard size={20} className="text-[#111111]" /> Últimas Transações
          </h2>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-slate-50 border border-[#0F172A08] px-3 py-1 rounded-full">
            {tableData.length} registros
          </span>
        </div>

        <div className="bg-white rounded-[32px] border border-[#0F172A08] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#0F172A08]">
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest whitespace-nowrap">Data</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Descrição</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Categoria</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Empresa</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest text-right">Valor</th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase text-[#64748B] tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F172A05]">
                {tableData.length > 0 ? tableData.map((row) => {
                  const isPositive = row.type === 'RECEITA';
                  return (
                    <tr 
                      key={row.id} 
                      className="group hover:bg-[#FAFAFA] transition-all cursor-pointer"
                      onClick={() => handleEditClick(row)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#111111]">{new Date(row.date || Date.now()).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] text-[#64748B] font-medium tracking-tight">Efetivado</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border border-[#0F172A05] ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          </div>
                          <span className="text-xs font-bold text-[#111111] truncate max-w-[200px]">{row.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-slate-50 border border-[#0F172A08] px-2.5 py-1 rounded-lg">
                          {row.category || 'Geral'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-[#475569]">{row.company || '-'}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`text-sm font-bold tracking-tight ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : '-'} {formatCurrency(Number(row.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border border-[#10B981]/20">
                          Liquidado
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-xs font-bold text-[#64748B] uppercase tracking-widest">
                      Nenhum lançamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FinanceEntryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEntry(null); }} 
        onSuccess={fetchData} 
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
