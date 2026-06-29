import { useState, useEffect } from 'react';
import { Package, CheckCircle2, FlaskConical, DollarSign, Rocket, Users, FolderGit2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProductStatsProps {
  totalProducts: number;
  activeProducts: number;
  devProducts: number;
  totalProjects: number;
}

export default function ProductStats({ totalProducts, activeProducts, devProducts, totalProjects }: ProductStatsProps) {
  const { token } = useAuth();
  const [data, setData] = useState<any>({ finance: [], deploys: [] });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/finance', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/deploys', { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(responses => Promise.all(responses.map(r => r.ok ? r.json() : [])))
    .then(([fins, deps]) => {
      setData({ finance: fins, deploys: deps });
    })
    .catch(err => console.error(err));
  }, [token]);

  const revenue = Array.isArray(data.finance) ? data.finance.filter((f: any) => f.type === 'RECEITA' && f.status === 'PAGO').reduce((acc: number, cur: any) => acc + parseFloat(cur.amount || '0'), 0) : 0;
  const deployCount = Array.isArray(data.deploys) ? data.deploys.length : 0;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
    return `R$ ${val}`;
  };

  const stats = [
    {
      title: 'Total de Produtos',
      value: totalProducts.toString(),
      trend: 'Geral',
      trendUp: true,
      subtext: `${activeProducts} em produção`,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Receita Anual/Mensal',
      value: formatCurrency(revenue),
      trend: 'Total',
      trendUp: true,
      subtext: 'Somatório de todas as receitas',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Em Desenvolvimento',
      value: devProducts.toString(),
      trend: 'Geral',
      trendUp: true,
      subtext: 'Lançamento próximo',
      icon: FlaskConical,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Deploys Realizados',
      value: deployCount.toString(),
      trend: 'Geral',
      trendUp: true,
      subtext: 'Histórico completo de releases',
      icon: Rocket,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white border border-[#0F172A08] rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.03)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
        >
          {/* Subtle Gradient Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FAFAFA] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-[100px]" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} border border-[#0F172A05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${stat.trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stat.trend}
            </div>
          </div>
          
          <div className="mt-6 relative z-10">
            <h3 className="text-[#64748B] text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-[#111111] tracking-tight">{stat.value}</span>
            </div>
            <p className="text-[#64748B] text-[13px] font-medium mt-2">{stat.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
