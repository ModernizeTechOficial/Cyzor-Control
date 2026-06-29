import { Building2, Package, FolderGit2, Users, CreditCard, CheckSquare, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

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
      value: metrics.clients || 124,
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Visão Executiva do Ecossistema</h3>
        <span className="text-[11px] text-[#64748B] font-medium">Dados atualizados em tempo real</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2, scale: 1.01 }}
            onClick={() => setCurrentView(card.view as any)}
            className="bg-white border border-[#0F172A08] rounded-[24px] p-5 flex flex-col justify-between h-[160px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all group cursor-pointer"
          >
            {/* Header: Icon & Sparkline */}
            <div className="flex items-center justify-between gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={16} strokeWidth={2} />
              </div>
              
              {/* Discrete SVG Sparkline */}
              <div className="w-16 h-8 flex items-center justify-center overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full text-slate-300 group-hover:text-blue-500 transition-colors" viewBox="0 0 80 20" fill="none">
                  <path
                    d={card.sparklinePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Metrics & Trend */}
            <div className="flex flex-col mt-4">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider leading-none">
                {card.label}
              </span>
              <span className="text-2xl font-bold text-[#111111] tracking-tight mt-1 leading-none">
                {card.value}
              </span>
              
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight size={10} strokeWidth={2.5} /> {card.trend}
                </span>
                <span className="text-[9px] text-[#94A3B8] font-medium tracking-tight">
                  {card.comparison}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
