import { useState, useEffect } from 'react';
import { GitBranch, Users, DollarSign, Download, CloudLightning, Key, Clock, Rocket } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function WorkspaceKPIs({ product }: { product: any }) {
  const { token } = useAuth();
  const [kpiData, setKpiData] = useState<any>(null);

  useEffect(() => {
    if (!product?.id || !token) return;

    fetch(`/api/products/${product.id}/kpis`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setKpiData(data);
      })
      .catch(err => console.error("Error fetching product KPIs:", err));
  }, [product?.id, token]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
    return `R$ ${val}`;
  };

  const kpis = [
    {
      title: 'Projetos',
      value: kpiData?.projects?.count || 0,
      subtext: 'Neste workspace',
      icon: GitBranch,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Clientes',
      value: kpiData?.projects?.count ? kpiData.projects.count * 3 : 0, // Mocked ratio since we don't have real clients per product
      subtext: 'Estimativa baseada em projetos',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Receita (MRR)',
      value: formatCurrency(kpiData?.revenue?.total || 0),
      subtext: 'Receita real vinculada',
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Deploys',
      value: kpiData?.deploys?.count || 0,
      subtext: kpiData?.deploys?.lastDeploy ? `Último ${kpiData.deploys.lastDeploy}` : 'Nenhum',
      icon: CloudLightning,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Licenças Ativas',
      value: '0',
      subtext: 'Em desenvolvimento',
      icon: Key,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      title: 'Downloads',
      value: '0',
      subtext: 'Módulo não conectado',
      icon: Download,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => (
        <div 
          key={i}
          className="bg-white border border-[#0F172A0F] rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[130px] group hover:border-[#0F172A15] hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse opacity-50" />
          </div>
          
          <div className="mt-4">
            <h3 className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mb-1">{kpi.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-[#111111] tracking-tight">{kpi.value}</span>
            </div>
            <p className="text-[11px] font-semibold text-[#64748B] mt-1">{kpi.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
