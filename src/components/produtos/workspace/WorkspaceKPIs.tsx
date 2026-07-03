import React, { useState, useEffect } from 'react';
import { GitBranch, Users, DollarSign, Key } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import MetricCard from '../../MetricCard';

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

  const productCount = kpiData?.projects?.count || 0;
  const clientsEstimate = kpiData?.projects?.count ? kpiData.projects.count * 3 : 0;
  const mrrRevenue = formatCurrency(kpiData?.revenue?.total || 0);

  return (
    <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <MetricCard
        title="Projetos"
        value={productCount.toString()}
        trend="Workspace"
        trendUp={true}
        contextText="projetos em andamento vinculados a este produto"
        icon={GitBranch}
      />
      <MetricCard
        title="Clientes"
        value={clientsEstimate.toString()}
        trend="Estimativa"
        trendUp={true}
        contextText="estimativa baseada nos contratos ativos"
        icon={Users}
      />
      <MetricCard
        title="Receita (MRR)"
        value={mrrRevenue}
        trend="Vinculada"
        trendUp={true}
        contextText="faturamento recorrente mensal associado"
        icon={DollarSign}
      />
      <MetricCard
        title="Licenças Ativas"
        value="0"
        trend="Pendente"
        trendUp={true}
        contextText="módulo de licenças em desenvolvimento"
        icon={Key}
      />
    </div>
  );
}
