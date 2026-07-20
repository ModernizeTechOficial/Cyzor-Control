import { Building2, Package, FolderGit2, Users, CreditCard, CheckSquare, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import MetricCard from '../MetricCard';

interface KPIProps {
  metrics: {
    companies: number;
    products: number;
    projects: number;
    clients: number;
    revenue: number;
    tasks: number;
  };
  setCurrentView: (view: any) => void;
}

interface CardConfig {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  comparison: string;
  sparklinePath: string;
  color: string;
  view: string;
}

export default function HomeKPIs({ metrics, setCurrentView }: KPIProps) {
  const cards: CardConfig[] = [
    {
      label: 'Empresas',
      value: metrics.companies || 0,
      icon: Building2,
      trend: '+12.4%',
      comparison: 'vs último mês',
      sparklinePath: 'M 0 16 Q 10 4 20 12 T 40 2 T 60 10 T 80 4',
      color: 'text-blue-600 bg-blue-50/50',
      view: 'empresas'
    },
    {
      label: 'Produtos',
      value: metrics.products || 0,
      icon: Package,
      trend: '+4.2%',
      comparison: 'vs último mês',
      sparklinePath: 'M 0 10 Q 10 16 20 8 T 40 14 T 60 4 T 80 8',
      color: 'text-indigo-600 bg-indigo-50/50',
      view: 'produtos'
    },
    {
      label: 'Projetos',
      value: metrics.projects || 0,
      icon: FolderGit2,
      trend: '+8.1%',
      comparison: 'vs última semana',
      sparklinePath: 'M 0 18 Q 10 10 20 14 T 40 4 T 60 12 T 80 2',
      color: 'text-[#111111] bg-slate-100/60',
      view: 'projetos'
    },
    {
      label: 'Clientes',
      value: metrics.clients || 0,
      icon: Users,
      trend: '+15.3%',
      comparison: 'vs último mês',
      sparklinePath: 'M 0 14 Q 10 18 20 10 T 40 6 T 60 8 T 80 2',
      color: 'text-[#111111] bg-slate-100/60',
      view: 'empresas'
    },
    {
      label: 'Receita',
      value: `R$ ${(metrics.revenue !== undefined && metrics.revenue !== null ? metrics.revenue : 0).toFixed(1)}k`,
      icon: CreditCard,
      trend: '+18.7%',
      comparison: 'vs último trimestre',
      sparklinePath: 'M 0 15 Q 10 12 20 16 T 40 6 T 60 4 T 80 1',
      color: 'text-emerald-600 bg-emerald-50/50',
      view: 'financeiro'
    },
    {
      label: 'Tarefas',
      value: metrics.tasks || 0,
      icon: CheckSquare,
      trend: '+12.5%',
      comparison: 'vs semana anterior',
      sparklinePath: 'M 0 18 Q 10 12 20 14 T 40 8 T 60 2 T 80 4',
      color: 'text-purple-600 bg-purple-50/50',
      view: 'projetos'
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em]">Cyzor Intelligence</span>
          <h2 className="text-sm font-display font-black text-[#0F172A]">Centro de Métricas Globais</h2>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Tempo Real</span>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {cards.map((card, i) => (
          <MetricCard
            key={i}
            title={card.label}
            value={card.value}
            icon={card.icon}
            trend={{
              value: card.trend,
              type: 'up',
              label: card.trend
            }}
            contextText={card.comparison}
            sparklinePath={card.sparklinePath}
            onClick={() => setCurrentView(card.view as any)}
          />
        ))}
      </div>
    </div>
  );
}

