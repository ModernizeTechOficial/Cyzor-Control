import { useState, useEffect } from 'react';
import { Activity, Download, Users, Key, Server, Rocket, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProductMetrics() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/deploys', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/finance', { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(responses => Promise.all(responses.map(r => r.ok ? r.json() : [])))
    .then(([prods, projs, deps, fins]) => {
      setData({ products: prods, projects: projs, deploys: deps, finance: fins });
    })
    .catch(err => console.error("Error fetching metrics:", err));
  }, [token]);

  const revenue = Array.isArray(data?.finance) ? data.finance.filter((f: any) => f.type === 'RECEITA' && f.status === 'PAGO').reduce((acc: number, cur: any) => acc + parseFloat(cur.amount || '0'), 0) : 0;
  const deployCount = Array.isArray(data?.deploys) ? data.deploys.length : 0;
  const projectCount = Array.isArray(data?.projects) ? data.projects.length : 0;
  const productCount = Array.isArray(data?.products) ? data.products.length : 0;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
    return `R$ ${val}`;
  };

  const metrics = [
    { label: 'Receita Total', value: formatCurrency(revenue), trend: '+0%', up: true, icon: Activity },
    { label: 'Produtos', value: productCount, trend: 'Total', up: true, icon: Server },
    { label: 'Projetos', value: projectCount, trend: 'Ativos', up: true, icon: Users },
    { label: 'Deploys Totais', value: deployCount, trend: 'Geral', up: true, icon: Rocket },
  ];

  return (
    <div className="bg-[#111111] rounded-[28px] p-6 sm:p-8 shadow-[0_20px_40px_rgb(0,0,0,0.1)] relative overflow-hidden text-white h-fit group">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
          <Activity size={18} className="text-white/50" />
          Métricas Globais
        </h3>
        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-white/50">
              <m.icon size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold text-white tracking-tight">{m.value}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.up ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {m.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
