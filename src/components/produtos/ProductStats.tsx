import { Package, CheckCircle2, FlaskConical, DollarSign, Rocket, Users, FolderGit2, TrendingUp, TrendingDown } from 'lucide-react';

interface ProductStatsProps {
  totalProducts: number;
  activeProducts: number;
  devProducts: number;
  totalProjects: number;
}

export default function ProductStats({ totalProducts, activeProducts, devProducts, totalProjects }: ProductStatsProps) {
  const stats = [
    {
      title: 'Total de Produtos',
      value: totalProducts.toString(),
      trend: '+3 este mês',
      trendUp: true,
      subtext: `${activeProducts} em produção`,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 84.500',
      trend: '↑ 12%',
      trendUp: true,
      subtext: 'vs último mês',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Em Desenvolvimento',
      value: devProducts.toString(),
      trend: '3 em fase final',
      trendUp: true,
      subtext: 'Lançamento próximo',
      icon: FlaskConical,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Deploys este mês',
      value: '128',
      trend: 'Estável',
      trendUp: true,
      subtext: 'Sem incidentes críticos',
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
