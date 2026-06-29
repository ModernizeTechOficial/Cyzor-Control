import { Building2, Package, Lightbulb, Users, CreditCard, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

interface KPIProps {
  metrics: {
    companies: number;
    products: number;
    projects: number;
    clients: number;
    revenue: number;
    deploys: number;
  };
}

const KpiCard = ({ icon: Icon, label, value, trend }: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col gap-2"
  >
    <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-xl">
            <Icon size={16} className="text-slate-500" />
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-bold text-[#111111]">{value}</span>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
    </div>
  </motion.div>
);

export default function HomeOverview({ metrics }: KPIProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <KpiCard icon={Building2} label="Empresas" value={metrics.companies} trend="+2%" />
      <KpiCard icon={Package} label="Produtos" value={metrics.products} trend="+5%" />
      <KpiCard icon={Lightbulb} label="Projetos" value={metrics.projects} trend="+12%" />
      <KpiCard icon={Users} label="Clientes" value={metrics.clients} trend="+8%" />
      <KpiCard icon={CreditCard} label="Receita" value={`R$ ${metrics.revenue.toFixed(0)}k`} trend="+18%" />
      <KpiCard icon={Rocket} label="Deploys" value={metrics.deploys} trend="+20%" />
    </div>
  );
}
