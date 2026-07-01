import React from 'react';
import { Users, Building, Activity, ShieldAlert, ArrowUpRight, CheckCircle, Flame, Sparkles } from 'lucide-react';

export default function SaaSAnalyticsCard() {
  const saasData = [
    { label: 'SaaS Active Tenants', value: '18 Workspaces', description: 'Bancos isolados ativos', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Daily Users', value: '1.420 Users', description: 'Usuários interagindo hoje', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'New Companies (B2B)', value: '38 Empresas', description: 'Novas adesões este mês', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Paid Plans', value: '14 Ativos', description: 'Planos Pro & Enterprise', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Trial active users', value: '4 Workspaces', description: 'Em período de testes', icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Canceled plans (30d)', value: '0 Cancels', description: 'Taxa de churn de 0%', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  const conversionData = [
    { metric: 'Conversion Rate (Trial to Paid)', value: '42.8%', trend: '+4.2%' },
    { metric: 'Top Product Catalyst', value: 'Cyzor Pro Premium', trend: 'Líder' },
    { metric: 'Avg Active Sessions / Tenant', value: '4.8h / dia', trend: 'Estável' }
  ];

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-1.5">
            <Users size={14} className="text-zinc-600" />
            SaaS Analytics & Customer Growth
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Controle granular de usuários, planos e taxa de retenção</p>
        </div>
        <span className="text-[9px] font-mono text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Activity size={10} className="text-emerald-500 animate-pulse" />
          Retenção: 100%
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        {saasData.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="p-4 bg-zinc-50/50 border border-[#ECECEF] rounded-2xl hover:bg-white hover:border-zinc-300 transition-all flex items-start gap-3 group">
              <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} border border-transparent group-hover:border-current flex items-center justify-center shrink-0 transition-all`}>
                <Icon size={14} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider font-mono truncate">{item.label}</span>
                <h4 className="text-[13px] font-extrabold text-zinc-950 truncate">{item.value}</h4>
                <p className="text-[9px] text-zinc-500 font-medium truncate">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion rates panel */}
      <div className="border border-[#ECECEF] p-4 rounded-2xl bg-zinc-50/20">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-mono mb-3">Métricas de Conversão</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {conversionData.map((conv, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#ECECEF] rounded-xl hover:border-zinc-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-zinc-400 font-bold uppercase truncate">{conv.metric}</span>
                <span className="text-[12px] font-extrabold text-zinc-900 mt-0.5">{conv.value}</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-0.5 shrink-0 select-none">
                <ArrowUpRight size={10} />
                {conv.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
