import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, TrendingUp, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../../../context/AuthContext';
import { useWorkspacePermissions } from '../../../../hooks/useWorkspacePermissions';

export default function FinanceiroTab({ product }: any) {
  const { fetchWithAuth } = useAuth();
  const { canViewFinance, isLoading: permissionsLoading } = useWorkspacePermissions();
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ mrr: 0, arr: 0, arpu: 0, lucroBruto: 0, margem: 0 });

  useEffect(() => {
    if (!product?.id || !canViewFinance) return;

    const fetchFinance = async () => {
      try {
        setLoading(true);
        // First get projects for this product
        const projRes = await fetchWithAuth('/api/projects');
        const projects = await projRes.json();
        if (!Array.isArray(projects)) throw new Error("Invalid projects data");
        const productProjectIds = projects.filter(p => p.productId === product.id).map(p => p.id);

        // Then get finance entries
        const finRes = await fetchWithAuth('/api/finance');
        if (!finRes.ok) throw new Error("Failed to fetch finance entries");
        const finances = await finRes.json();
        
        if (Array.isArray(finances)) {
          const productFinances = finances.filter(f => productProjectIds.includes(f.projectId));
          
          // Calculate metrics
          const receitas = productFinances.filter(f => f.type === 'RECEITA' && f.status === 'PAGO');
          const despesas = productFinances.filter(f => f.type === 'DESPESA' && f.status === 'PAGO');
          
          const totalReceita = receitas.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
          const totalDespesa = despesas.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
          
          const mrr = totalReceita / 12; // simplified average monthly
          const arr = totalReceita; // simplified total as annual
          const arpu = productProjectIds.length > 0 ? totalReceita / productProjectIds.length : 0;
          const lucroBruto = totalReceita - totalDespesa;
          const margem = totalReceita > 0 ? Math.round((lucroBruto / totalReceita) * 100) : 0;

          setMetrics({ mrr, arr, arpu, lucroBruto, margem });

          // Group by month for the chart (simplified)
          const monthlyData: Record<string, number> = {};
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          
          // Initialize last 6 months
          const today = new Date();
          for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthlyData[months[d.getMonth()]] = 0;
          }

          receitas.forEach(f => {
            const d = new Date(f.date);
            const monthName = months[d.getMonth()];
            if (monthlyData[monthName] !== undefined) {
              monthlyData[monthName] += parseFloat(f.amount || '0');
            }
          });

          const chartData = Object.keys(monthlyData).map(key => ({
            name: key,
            revenue: monthlyData[key]
          }));
          
          setFinanceData(chartData);
        }
      } catch (error) {
        console.error("Error fetching finance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, [product?.id, canViewFinance]);

  if (!permissionsLoading && !canViewFinance) {
    return (
      <div className="p-8 text-center text-[#64748B] text-sm font-medium">
        Você não tem permissão para acessar o Financeiro deste produto.
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando dados financeiros...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Financeiro</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Receita Mensal Média (MRR)</p>
          <h3 className="text-3xl font-display font-bold text-[#111111]">{formatShortCurrency(metrics.mrr)}</h3>
        </div>

        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Receita Total (ARR)</p>
          <h3 className="text-3xl font-display font-bold text-[#111111]">{formatShortCurrency(metrics.arr)}</h3>
        </div>
        
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Ticket Médio por Projeto</p>
          <h3 className="text-3xl font-display font-bold text-[#111111]">{formatCurrency(metrics.arpu)}</h3>
        </div>

        <div className="bg-[#111111] border border-black rounded-[24px] p-6 shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent blur-2xl" />
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Lucro Bruto</p>
            <h3 className="text-3xl font-display font-bold text-white mb-4">{formatShortCurrency(metrics.lucroBruto)}</h3>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${Math.max(0, Math.min(100, metrics.margem))}%` }} />
            </div>
            <p className="text-[10px] font-bold text-white/60 mt-2">{metrics.margem}% Margem</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#0F172A0F] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] mb-8">Evolução da Receita (6 Meses)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0F172A08" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `R$${val >= 1000 ? val/1000 + 'k' : val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111111', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
