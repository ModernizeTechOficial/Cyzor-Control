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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import StatCard from '../components/StatCard.tsx';
import AIInsightCard from '../components/AIInsightCard.tsx';
import InfrastructureHealth from '../components/InfrastructureHealth.tsx';
import DeploymentCard from '../components/DeploymentCard.tsx';
import ActivityTimeline from '../components/ActivityTimeline.tsx';
import RevenueFinanceCard from '../components/RevenueFinanceCard.tsx';
import SaaSAnalyticsCard from '../components/SaaSAnalyticsCard.tsx';

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
          <p className="text-xs font-bold text-zinc-900 font-mono uppercase tracking-wider">Sincronizando Plataforma...</p>
          <p className="text-[11px] text-zinc-500 font-sans">Carregando dados consolidados dos microsserviços e billing da CYZOR...</p>
        </div>
      </div>
    );
  }

  // Pre-defined values or fallback values from metrics endpoint
  const totalTenants = metrics?.totalTenants || 18;
  const totalUsers = metrics?.totalUsers || 1420;
  const totalCompanies = metrics?.totalCompanies || 38;
  const totalProjects = metrics?.totalProjects || 24;

  const kpis = [
    {
      label: 'Total Workspaces SaaS',
      value: totalTenants,
      icon: Building2,
      trend: '+12%',
      trendDirection: 'up' as const,
      sparkData: [12, 14, 13, 15, 17, 16, 18],
      accentColor: '#6366F1'
    },
    {
      label: 'Usuários Ativos Globais',
      value: totalUsers,
      icon: Users,
      trend: '+8.4%',
      trendDirection: 'up' as const,
      sparkData: [1100, 1150, 1210, 1280, 1310, 1390, 1420],
      accentColor: '#06B6D4'
    },
    {
      label: 'Empresas Atendidas',
      value: totalCompanies,
      icon: Briefcase,
      trend: '+14.5%',
      trendDirection: 'up' as const,
      sparkData: [28, 30, 31, 34, 35, 36, 38],
      accentColor: '#8B5CF6'
    },
    {
      label: 'Database Projects',
      value: totalProjects,
      icon: Cpu,
      trend: 'Uptime 100%',
      trendDirection: 'neutral' as const,
      sparkData: [20, 22, 21, 23, 23, 24, 24],
      accentColor: '#10B981'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* 1. HERO DO DASHBOARD - WELCOME AREA */}
      <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle decorative vector mesh overlay for high-end look */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,#EEF2FF_0%,transparent_70%)] pointer-events-none -z-10" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full select-none uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Sparkles size={11} className="animate-spin text-indigo-600" />
              Platform HQ Active
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight leading-none mb-1">
              Bom dia, {user?.displayName || 'Diego'} 👋
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              Toda sua infraestrutura está funcionando normalmente.
            </p>
          </div>

          {/* Chips showing Core platform features */}
          <div className="flex flex-wrap gap-2 pt-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-zinc-950 text-white rounded-xl border border-zinc-900 shadow-sm">
              ● Production
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-[#FAFAFB] text-zinc-600 rounded-xl border border-[#ECECEF] shadow-sm">
              {totalTenants} Active SaaS
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-sm">
              99.99% Uptime
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-1">
              <CreditCard size={10} /> Stripe Connected
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-zinc-50 text-zinc-700 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-1">
              <GitBranch size={10} /> GitHub Connected
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 shadow-sm flex items-center gap-1">
              <Sparkles size={10} /> AI Enabled
            </span>
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2.5 bg-[#FAFAFB] hover:bg-zinc-100 border border-[#ECECEF] text-zinc-700 hover:text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start md:self-center shrink-0 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin text-indigo-600' : 'text-zinc-500'} />
          <span>{loading ? 'Sincronizando...' : 'RESSINCRONIZAR INFRA'}</span>
        </button>
      </div>

      {/* 2. REUSABLE KPIs CARD BLOCK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard 
            key={idx}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            trendDirection={kpi.trendDirection}
            sparkData={kpi.sparkData}
            accentColor={kpi.accentColor}
          />
        ))}
      </div>

      {/* 3. BUSINESS OVERVIEW SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-mono">
            Business Overview & Revenue Ledger
          </h2>
          <div className="h-[1px] bg-[#ECECEF] flex-1" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RevenueFinanceCard />
          </div>
          <div>
            <SaaSAnalyticsCard />
          </div>
        </div>
      </div>

      {/* 4. INFRASTRUCTURE & SECURITY INSIGHTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-mono">
            Infrastructure & AI Observability
          </h2>
          <div className="h-[1px] bg-[#ECECEF] flex-1" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <InfrastructureHealth />
          </div>
          <div>
            <AIInsightCard />
          </div>
        </div>
      </div>

      {/* 5. DEPLOYS & PLATFORM ACTIVITY TIMELINE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-mono">
            Deploys & Operational Activity
          </h2>
          <div className="h-[1px] bg-[#ECECEF] flex-1" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <DeploymentCard />
          </div>
          <div>
            <ActivityTimeline />
          </div>
        </div>
      </div>

    </div>
  );
}
