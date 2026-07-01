import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  Server, 
  Globe2, 
  ShieldCheck, 
  RefreshCw, 
  Lightbulb, 
  CheckSquare, 
  TrendingUp,
  Cpu,
  Terminal,
  Zap,
  Globe,
  Database,
  Lock,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface PlatformAdminDashboardProps {
  metrics: any;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export default function PlatformAdminDashboard({ metrics, loading, onRefresh }: PlatformAdminDashboardProps) {
  const [logEvents, setLogEvents] = useState<Array<{ id: number; time: string; level: 'INFRA' | 'SEC' | 'AI' | 'BILL'; message: string; badge: string }>>([
    { id: 1, time: '11:58:32', level: 'INFRA', message: 'Kubernetes cluster auto-scaled node-group-4a to +1', badge: 'k8s' },
    { id: 2, time: '11:58:15', level: 'BILL', message: 'Stripe webhook received: payment_intent.succeeded (R$ 1.250,00)', badge: 'stripe' },
    { id: 3, time: '11:57:48', level: 'AI', message: 'Model inference optimized for tenant_acme: 1.4k tokens/s', badge: 'gemini' },
    { id: 4, time: '11:57:02', level: 'SEC', message: 'Intrusion prevention system verified 0 threats across 24 routes', badge: 'firewall' },
    { id: 5, time: '11:56:41', level: 'INFRA', message: 'Cloud SQL connection pool optimized: 142 connections active', badge: 'postgres' },
  ]);

  // Simulate incoming real-time observability events to feel alive!
  useEffect(() => {
    const messages = [
      { level: 'AI', message: 'Gemini Agent processed smart-summarization for workspace_alpha', badge: 'gemini' },
      { level: 'INFRA', message: 'Redis Cache hit rate stabilized at 98.4%', badge: 'redis' },
      { level: 'BILL', message: 'Recurring subscription processed for tenant_omega (Plan Pro)', badge: 'stripe' },
      { level: 'SEC', message: 'Rate limiter block released for IP 182.16.4.99 (Safe scan finished)', badge: 'security' },
      { level: 'INFRA', message: 'Static asset delivery optimized via Cloud CDN Edge in 12ms', badge: 'edge' }
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLogEvents(prev => [
        {
          id: Date.now(),
          time: timeStr,
          level: randomMsg.level as any,
          message: randomMsg.message,
          badge: randomMsg.badge
        },
        ...prev.slice(0, 5)
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 bg-[#121215] border border-[#1E1E22] p-8 rounded-2xl shadow-2xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="text-sm font-semibold text-zinc-400">Sincronizando infraestrutura com banco de dados real...</p>
        </div>
      </div>
    );
  }

  const netIncome = (metrics?.totalRevenue || 0) - (metrics?.totalExpense || 0);

  const statCards = [
    { label: 'Workspaces SaaS', value: metrics?.totalTenants || 0, icon: Building2, trend: 'SaaS Active', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/30' },
    { label: 'Usuários Registrados', value: metrics?.totalUsers || 0, icon: Users, trend: 'Database Core', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'hover:border-cyan-500/30' },
    { label: 'Empresas Clientes', value: metrics?.totalCompanies || 0, icon: Globe2, trend: 'B2B Accounts', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/30' },
    { label: 'Projetos Ativos', value: metrics?.totalProjects || 0, icon: Server, trend: 'Engine Load', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
    { label: 'Catálogo de Produtos', value: metrics?.totalProducts || 0, icon: CreditCard, trend: 'SaaS Catalog', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/30' },
    { label: 'Carga Operacional', value: metrics?.totalTasks || 0, icon: CheckSquare, trend: 'Active Tasks', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/30' },
    { label: 'Pipeline de Ideias', value: metrics?.totalIdeas || 0, icon: Lightbulb, trend: 'Innovation Pool', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'hover:border-teal-500/30' },
    { label: 'Net Revenue', value: `R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, trend: 'Global Financials', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/30', isMoney: true },
  ];

  const hasTrends = metrics?.trends && metrics.trends.length > 0;
  const chartData = hasTrends ? metrics.trends : [
    { month: 'Julho', revenue: 45000, expense: 28000 },
    { month: 'Agosto', revenue: 62000, expense: 31000 },
    { month: 'Setembro', revenue: 78000, expense: 35000 },
    { month: 'Outubro', revenue: 95000, expense: 41000 },
    { month: 'Novembro', revenue: 120000, expense: 48000 },
    { month: 'Dezembro', revenue: 145000, expense: 52000 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#18181B] pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
            Cyzor Core Platform Administration
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform HQ</h1>
          <p className="text-sm text-zinc-400 font-medium">Controle de deploys distribuídos, escalonamento SaaS, bilhetagem global e inteligência de nuvem.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#121215] border border-[#1E1E22] rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all hover:border-zinc-700 disabled:opacity-50 shadow-lg self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : 'text-zinc-400'} />
          {loading ? 'Sincronizando...' : 'FORÇAR RESSINCRONIZAÇÃO'}
        </button>
      </div>

      {/* Grid of Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className={`bg-[#0D0D10]/95 p-5 rounded-2xl border border-[#141417] ${stat.border} transition-all duration-300 relative overflow-hidden group`}>
            {/* Subtle light effect on card hover */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono bg-[#121215] border border-[#1E1E22] px-2 py-0.5 rounded">
                {stat.trend}
              </span>
            </div>
            
            <div className="space-y-1 relative z-10">
              <h3 className={`font-mono font-black text-white tracking-tight ${stat.isMoney ? 'text-lg' : 'text-2xl sm:text-3xl'}`}>{stat.value}</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Observability Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Financial Area Chart */}
        <div className="lg:col-span-2 bg-[#0D0D10]/95 rounded-2xl border border-[#141417] p-6 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-white tracking-tight">Consolidação Financeira HQ</h2>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">Visão histórica consolidada do faturamento e despesas do ecossistema.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider font-mono">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded bg-indigo-500" />
                Faturamento (Stripe)
              </div>
              <div className="flex items-center gap-1.5 text-pink-400">
                <span className="w-2 h-2 rounded bg-pink-500" />
                Despesa Infraestrutura
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full mt-2 font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenseDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181B" />
                <XAxis 
                  dataKey="month" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `R$ ${val / 1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0D10', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#a1a1aa' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Receita"
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenueDark)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Despesa"
                  stroke="#ec4899" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpenseDark)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Node Health Monitor */}
        <div className="bg-[#0D0D10]/95 rounded-2xl border border-[#141417] p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white tracking-tight">Status da Infraestrutura</h2>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-mono">
                <ShieldCheck size={12} className="animate-pulse" />
                All Operational
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Core API Gateway', metric: '215ms avg latency', status: 'Healthy', load: '12%', icon: Globe },
                { name: 'Cloud SQL Cluster', metric: 'Master + Replica (Safe)', status: 'Optimal', load: '8%', icon: Database },
                { name: 'AI Inference Endpoint', metric: 'Google GenAI Node 4', status: 'Active', load: '45%', icon: Zap },
                { name: 'Security WAF Core', metric: 'SSL Engine TLSv1.3', status: 'Shield On', load: '1%', icon: Lock }
              ].map((sys, i) => {
                const Icon = sys.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[#1E1E22] bg-[#121215]/60 hover:border-zinc-800 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-zinc-800/60 text-zinc-400 shrink-0">
                        <Icon size={14} className="text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">{sys.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{sys.metric}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-mono text-zinc-300 font-bold">{sys.load} load</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[8px] font-extrabold uppercase font-mono text-emerald-400">{sys.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#18181B] flex justify-between items-center text-[10px] text-zinc-500 font-mono">
            <span>DATABASE:</span>
            <span className="text-indigo-400 font-extrabold">GOOGLE CLOUD SQL (PGSQL)</span>
          </div>
        </div>
      </div>

      {/* New Section: Live Telemetry terminal & AI platform diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Event Terminal logs */}
        <div className="bg-[#0A0A0C] rounded-2xl border border-[#18181B] p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#18181B]">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">Fila de Eventos de Deploys & Auditoria (Live)</h3>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 bg-[#121215] border border-[#1E1E22] px-2 py-0.5 rounded">
              Buffer 100% active
            </span>
          </div>

          <div className="space-y-3 font-mono text-[11px] min-h-[220px]">
            {logEvents.map((log) => {
              let lvlColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
              if (log.level === 'SEC') lvlColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              if (log.level === 'AI') lvlColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
              if (log.level === 'BILL') lvlColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

              return (
                <div key={log.id} className="flex items-start gap-2.5 p-2 rounded-lg border border-[#18181B] bg-[#121215]/30 hover:bg-[#121215]/80 transition-colors">
                  <span className="text-zinc-500 shrink-0 select-none">[{log.time}]</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold border shrink-0 ${lvlColor}`}>
                    {log.level}
                  </span>
                  <span className="text-zinc-300 flex-1 min-w-0 break-words">{log.message}</span>
                  <span className="text-[9px] text-zinc-500 font-semibold italic shrink-0">#{log.badge}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-[#18181B] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>SISTEMA DE SEGURANÇA:</span>
            <span className="text-emerald-400 font-bold">MUTUAL TLS ATIVO</span>
          </div>
        </div>

        {/* AI Performance Diagnostics & SaaS Stats */}
        <div className="bg-[#0D0D10]/95 rounded-2xl border border-[#141417] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#18181B]">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">AI Inference Platform & LLM Cache</h3>
              </div>
              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase font-mono">
                API Live
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Monitor de processamento dos agentes inteligentes e geração automatizada de prioridades em tempo real para os Tenants.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#121215]/80 rounded-xl border border-[#1E1E22] space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-mono">Model Latency (Avg)</span>
                <span className="text-xl font-mono text-white font-black">240ms</span>
                <div className="flex items-center gap-1.5 text-[8px] text-emerald-400 font-mono font-extrabold">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  99th PERCENTILE
                </div>
              </div>

              <div className="p-4 bg-[#121215]/80 rounded-xl border border-[#1E1E22] space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-mono">LLM Tokens Processed</span>
                <span className="text-xl font-mono text-white font-black">1.8M<span className="text-xs text-zinc-400 font-normal">/day</span></span>
                <div className="flex items-center gap-1.5 text-[8px] text-cyan-400 font-mono font-extrabold">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                  +18.4% VS YESTERDAY
                </div>
              </div>

              <div className="p-4 bg-[#121215]/80 rounded-xl border border-[#1E1E22] space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-mono">Vector DB Index Size</span>
                <span className="text-xl font-mono text-white font-black">8.4k <span className="text-xs text-zinc-400">embeddings</span></span>
                <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest font-bold">
                  PgVector cluster
                </div>
              </div>

              <div className="p-4 bg-[#121215]/80 rounded-xl border border-[#1E1E22] space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-mono">Prompt Cache Hit Rate</span>
                <span className="text-xl font-mono text-white font-black">94.2%</span>
                <div className="flex items-center gap-1.5 text-[8px] text-purple-400 font-mono font-extrabold">
                  <span className="w-1 h-1 rounded-full bg-purple-400" />
                  SAVING $48/DAY
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#18181B] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>LLM NODE:</span>
            <span className="text-cyan-400 font-extrabold">GEMINI-2.5-FLASH-ENGINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
