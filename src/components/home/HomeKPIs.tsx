import { Building2, Package, Lightbulb, CreditCard, Users, Rocket } from 'lucide-react';

const kpis = [
  { label: 'Organizações', value: '12', trend: '+2', icon: Building2 },
  { label: 'Produtos', value: '45', trend: '+5', icon: Package },
  { label: 'Projetos', value: '128', trend: '+12', icon: Lightbulb },
  { label: 'Receita', value: 'R$ 84.5k', trend: '+18%', icon: CreditCard },
  { label: 'Clientes', value: '842', trend: '+50', icon: Users },
  { label: 'Deploys', value: '1.2k', trend: '+200', icon: Rocket },
];

export default function HomeKPIs() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white border border-[#0F172A08] rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <kpi.icon size={20} className="text-[#64748B]" />
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{kpi.trend}</span>
            </div>
            <h3 className="text-sm font-bold text-[#111111]">{kpi.value}</h3>
            <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-widest mt-1">{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}
