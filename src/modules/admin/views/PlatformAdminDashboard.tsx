import React from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Cpu, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  GitBranch, 
  CreditCard, 
  Sparkles,
  ShieldCheck,
  Calendar,
  Download,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import StatCard from '../components/StatCard.tsx';
import RevenueFinanceCard from '../components/RevenueFinanceCard.tsx';
import SaaSAnalyticsCard from '../components/SaaSAnalyticsCard.tsx';
import DeploymentCard from '../components/DeploymentCard.tsx';

interface PlatformAdminDashboardProps {
  metrics: any;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export default function PlatformAdminDashboard({ metrics, loading, onRefresh }: PlatformAdminDashboardProps) {
  const { user } = useAuth();

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-4 bg-white border border-[#ECECEF] p-8 rounded-[24px] shadow-sm max-w-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">Syncing...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = metrics?.totalRevenue || 0;
  const totalExpense = metrics?.totalExpense || 0;
  const totalTenants = metrics?.totalTenants || 0;
  const totalUsers = metrics?.totalUsers || 0;
  const totalProjects = metrics?.totalProjects || 0;
  const totalTasks = metrics?.totalTasks || 0;

  const kpis = [
    {
      label: 'Receita Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue),
      trend: 'Atualizado hoje',
      trendDirection: 'up' as const,
      sparkData: metrics?.trends?.length > 0 ? metrics.trends.map((t: any) => t.revenue) : [0, 0, 0],
    },
    {
      label: 'Despesa Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense),
      trend: 'Atualizado hoje',
      trendDirection: 'down' as const,
      sparkData: metrics?.trends?.length > 0 ? metrics.trends.map((t: any) => t.expense) : [0, 0, 0],
    },
    {
      label: 'Total de Tenants',
      value: `${totalTenants} Tenants`,
      trend: 'SaaS Ativos',
      trendDirection: 'up' as const,
      sparkData: [totalTenants > 0 ? totalTenants - 1 : 0, totalTenants],
    },
    {
      label: 'Usuários Globais',
      value: `${totalUsers} Usuários`,
      trend: 'Plataforma',
      trendDirection: 'up' as const,
      sparkData: [totalUsers > 0 ? totalUsers - 1 : 0, totalUsers],
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-4">
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Bem vindo!, {user?.displayName?.split(' ')[0] || 'Salung'}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
            <span>Daily</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
            <Calendar size={14} className="text-gray-400" />
            <span>6 Nov 2025</span>
          </div>
          <button 
            className="flex items-center gap-2 bg-gray-800 text-white border border-gray-900 hover:bg-black rounded-lg px-4 py-1.5 shadow-sm text-xs font-medium transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard 
            key={idx}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendDirection={kpi.trendDirection}
            sparkData={kpi.sparkData}
          />
        ))}
      </div>

      {/* 3. Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueFinanceCard metrics={metrics} />
        </div>
        <div>
          <SaaSAnalyticsCard metrics={metrics} />
        </div>
      </div>

      {/* 4. Table */}
      <div className="w-full">
        <DeploymentCard metrics={metrics} />
      </div>

    </div>
  );
}
