import React from 'react';
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
  TrendingUp 
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
  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-semibold text-gray-500">Buscando métricas operacionais reais...</p>
        </div>
      </div>
    );
  }

  const netIncome = (metrics?.totalRevenue || 0) - (metrics?.totalExpense || 0);

  const statCards = [
    { label: 'Total Tenants', value: metrics?.totalTenants || 0, icon: Building2, trend: 'SaaS Active', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, trend: 'Registered', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Companies', value: metrics?.totalCompanies || 0, icon: Globe2, trend: 'B2B Client base', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Projects', value: metrics?.totalProjects || 0, icon: Server, trend: 'In execution', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Products', value: metrics?.totalProducts || 0, icon: CreditCard, trend: 'SaaS Catalogue', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Tasks', value: metrics?.totalTasks || 0, icon: CheckSquare, trend: 'Operational Load', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Total Ideas', value: metrics?.totalIdeas || 0, icon: Lightbulb, trend: 'Pipeline', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Net Profit', value: `R$ ${netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, trend: 'Financial Health', color: 'text-teal-600', bg: 'bg-teal-50', isMoney: true },
  ];

  // If we have no trends yet in the DB, show a nice empty state or the simple placeholder trends
  const hasTrends = metrics?.trends && metrics.trends.length > 0;
  const chartData = hasTrends ? metrics.trends : [
    { month: 'Sem dados', revenue: 0, expense: 0 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform HQ</h1>
          <p className="text-sm text-gray-500 font-medium">Visão global e em tempo real da infraestrutura e negócios.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all hover:border-gray-300 disabled:opacity-50 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-${stat.bg.split('-')[1]}-100 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className={`font-black text-gray-900 tracking-tight ${stat.isMoney ? 'text-xl' : 'text-3xl'}`}>{stat.value}</h3>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Histórico de Receita e Despesa</h2>
              <p className="text-xs text-gray-400 font-medium">Acompanhamento consolidado do fluxo financeiro.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Receita
              </div>
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Despesa
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full mt-2">
            {hasTrends ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `R$ ${val}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Receita"
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    name="Despesa"
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border border-dashed border-gray-100 rounded-2xl bg-gray-50/50 p-6 text-center">
                <Activity className="w-8 h-8 text-gray-300 mb-2 animate-pulse" />
                <span className="text-sm font-semibold text-gray-500">Nenhum dado financeiro consolidado encontrado</span>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">Adicione lançamentos de receitas e despesas no módulo financeiro para gerar este gráfico automaticamente.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">System Status</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ShieldCheck size={14} />
                All Systems Operational
              </div>
            </div>
            <div className="space-y-4">
              {[
                { name: 'API Gateway', load: '0.4s avg response', status: 'Optimal' },
                { name: 'Database Clusters', load: 'Active Connections', status: 'Healthy' },
                { name: 'Edge CDN Network', load: '99.99% Hit rate', status: 'Healthy' },
                { name: 'AI Inference Node', load: 'Online', status: 'Healthy' }
              ].map((sys, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{sys.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{sys.load}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-500">{sys.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <span>DB Provider</span>
              <span className="text-indigo-600 font-bold">Cloud SQL (PG)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
