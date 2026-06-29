import { Activity, Building2, DollarSign, FolderGit2, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface CompanyStatsProps {
  totalCompanies: number;
  activeCompanies: number;
  totalRevenue: number;
  totalProjects: number;
}

export default function CompanyStats({ totalCompanies, activeCompanies, totalRevenue, totalProjects }: CompanyStatsProps) {
  const stats = [
    {
      title: 'Empresas',
      value: totalCompanies.toString(),
      trend: '+12 este mês',
      trendUp: true,
      subtext: `${activeCompanies} ativas no momento`,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Receita',
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: '↑ 18%',
      trendUp: true,
      subtext: 'Comparado ao mês anterior',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Projetos',
      value: totalProjects.toString(),
      trend: '+4 concluídos',
      trendUp: true,
      subtext: 'Em andamento',
      icon: FolderGit2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Clientes',
      value: '420',
      trend: '+8 hoje',
      trendUp: true,
      subtext: 'Usuários ativos',
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
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
