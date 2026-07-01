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
      
      {/* 1. HERO DO DASHBOARD - WELCOME AREA REDESIGN */}
      <div className="bg-white border border-[#ECECEF] rounded-[24px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.01)] relative overflow-hidden transition-all duration-300">
        {/* Premium subtle graphic layout element (Light ambient blur) */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,#EEF2FF_0%,transparent_60%)] pointer-events-none -z-10" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Core info and dynamic status grid */}
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  SYSTEM CORE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-ping" />
                <span className="text-[10px] font-bold text-zinc-500 font-mono flex items-center gap-1">
                  PLATFORM HQ
                </span>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight leading-none mb-2">
                  Bom dia, {user?.displayName || 'Diego'} 👋
                </h1>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">
                  Toda a sua infraestrutura cloud, automações de microsserviços e gateways estão operando normalmente.
                </p>
              </div>
            </div>

            {/* Premium Interactive Cockpit Grid - Vercel/Linear style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              
              {/* Status 1: Environment */}
              <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[16px] p-3 hover:border-zinc-300 transition-all group flex flex-col justify-between h-16">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Environment</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-zinc-950">Production HQ</span>
                </div>
              </div>

              {/* Status 2: SaaS Tenants */}
              <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[16px] p-3 hover:border-zinc-300 transition-all group flex flex-col justify-between h-16">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Workspaces</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 size={12} className="text-zinc-600" />
                  <span className="text-[11px] font-bold text-zinc-950">{totalTenants} Active SaaS</span>
                </div>
              </div>

              {/* Status 3: Uptime */}
              <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[16px] p-3 hover:border-zinc-300 transition-all group flex flex-col justify-between h-16">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Uptime Monitor</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] font-bold text-emerald-600 font-mono">99.99% Global</span>
                </div>
              </div>

              {/* Status 4: Stripe Gate */}
              <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[16px] p-3 hover:border-zinc-300 transition-all group flex flex-col justify-between h-16">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Stripe Gateway</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CreditCard size={12} className="text-[#6366F1]" />
                  <span className="text-[11px] font-bold text-zinc-950">Connected</span>
                </div>
              </div>

              {/* Status 5: GitHub integrations */}
              <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[16px] p-3 hover:border-zinc-300 transition-all group flex flex-col justify-between h-16">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Git Engine</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <GitBranch size={12} className="text-zinc-800" />
                  <span className="text-[11px] font-bold text-zinc-950">Synced</span>
                </div>
              </div>

              {/* Status 6: AI Assistant core */}
              <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[16px] p-3 hover:border-zinc-300 transition-all group flex flex-col justify-between h-16">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">AI Observers</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles size={11} className="text-[#8B5CF6] animate-pulse" />
                  <span className="text-[11px] font-bold text-zinc-950">Enabled</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Premium Active Latency Card and Resync Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-4 border border-[#ECECEF] p-5 rounded-[20px] bg-[#FAFAFB] lg:min-w-[280px]">
            <div className="space-y-1.5 text-left lg:text-right w-full">
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block font-mono">CYZOR CLOUD METRICS</span>
              <div className="flex items-center lg:justify-end gap-2">
                <span className="text-2xl font-black text-zinc-950 tracking-tight font-mono">42ms</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">Global Avg</span>
              </div>
              <span className="text-[9px] text-zinc-400 font-medium block">Orquestrador AWS & GCP conectado com sucesso</span>
            </div>

            <div className="h-[1px] w-full bg-[#ECECEF] hidden lg:block" />

            <button 
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95 disabled:opacity-50 w-full"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin text-indigo-400' : 'text-zinc-400'} />
              <span>{loading ? 'Sincronizando...' : 'RESSINCRONIZAR INFRA'}</span>
            </button>
          </div>
        </div>
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
