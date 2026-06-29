import { useState, useEffect } from 'react';
import { Package, DollarSign, FlaskConical, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MetricCard from '../MetricCard';

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
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard 
        title="Total de Produtos"
        value={totalProducts}
        trend="Geral"
        trendUp={true}
        sub={`${activeProducts} em produção`}
        icon={Package}
        color="text-blue-600"
        bg="bg-blue-50/50"
      />
      <MetricCard 
        title="Receita Anual/Mensal"
        value={formatCurrency(revenue)}
        trend="Total"
        trendUp={true}
        sub="Somatório de todas as receitas"
        icon={DollarSign}
        color="text-emerald-600"
        bg="bg-emerald-50/50"
      />
      <MetricCard 
        title="Em Desenvolvimento"
        value={devProducts}
        trend="Geral"
        trendUp={true}
        sub="Lançamento próximo"
        icon={FlaskConical}
        color="text-amber-600"
        bg="bg-amber-50/50"
      />
      <MetricCard 
        title="Deploys Realizados"
        value={deployCount}
        trend="Geral"
        trendUp={true}
        sub="Histórico completo de releases"
        icon={Rocket}
        color="text-purple-600"
        bg="bg-purple-50/50"
      />
    </div>
  );
}

