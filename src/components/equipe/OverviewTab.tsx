import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Building2, CalendarRange, CircleDollarSign, Mail, ShieldCheck, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const chartData = [
  { name: 'Seg', team: 8, entries: 3, exits: 1 },
  { name: 'Ter', team: 10, entries: 4, exits: 1 },
  { name: 'Qua', team: 12, entries: 3, exits: 2 },
  { name: 'Qui', team: 14, entries: 5, exits: 1 },
  { name: 'Sex', team: 15, entries: 4, exits: 2 },
  { name: 'Sab', team: 13, entries: 2, exits: 1 },
  { name: 'Dom', team: 12, entries: 1, exits: 0 },
];

const departmentShare = [
  { name: 'Tecnologia', value: 34 },
  { name: 'Vendas', value: 22 },
  { name: 'Financeiro', value: 16 },
  { name: 'RH', value: 12 },
  { name: 'Operações', value: 16 },
];

const roleShare = [
  { name: 'Owner', value: 1 },
  { name: 'Manager', value: 8 },
  { name: 'Member', value: 40 },
  { name: 'Developer', value: 18 },
  { name: 'Finance', value: 6 },
  { name: 'Designer', value: 5 },
];

export default function OverviewTab() {
  const { fetchWithAuth } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, invitationsRes] = await Promise.all([
          fetchWithAuth('/api/workspace/members'),
          fetchWithAuth('/api/workspace/invitations'),
        ]);

        if (membersRes.ok) setMembers(await membersRes.json());
        if (invitationsRes.ok) setInvitations(await invitationsRes.json());
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [fetchWithAuth]);

  const metrics = useMemo(() => {
    const activeMembers = members.filter((member) => member.status === 'Ativo' || member.status === 'ACTIVE');
    const inactiveMembers = members.filter((member) => member.status !== 'Ativo' && member.status !== 'ACTIVE');
    const pendingInvitations = invitations.filter((inv) => inv.status === 'PENDING');
    const uniqueDepartments = new Set(members.map((member) => member.department || member.cargo || 'General')).size;
    const uniqueTeams = new Set(members.map((member) => member.team || member.equipe || 'Sem equipe')).size;
    const managers = members.filter((member) => /manager|admin|owner/i.test(member.role || '')).length;
    const noTeam = members.filter((member) => !member.team && !member.equipe).length;
    const noManager = members.filter((member) => !member.manager && !member.gestor).length;
    const newThisMonth = members.filter((member) => {
      const createdAt = new Date(member.createdAt || member.created_at || Date.now());
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;
    const avgCareer = Math.max(1, Math.round((members.length ? members.reduce((acc, member) => acc + (member.careerLevel || 3), 0) / members.length : 0)));
    const healthScore = Math.max(65, Math.round((activeMembers.length / Math.max(1, members.length)) * 55 + (pendingInvitations.length > 0 ? 12 : 18) + (noTeam ? 4 : 8) + (avgCareer > 3 ? 8 : 2)));

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      pendingInvitations: pendingInvitations.length,
      teams: uniqueTeams,
      departments: uniqueDepartments,
      managers,
      healthScore,
      careerHub: avgCareer,
      newThisMonth,
      noTeam,
      noManager,
    };
  }, [invitations, members]);

  if (loading) return <div className="text-sm text-slate-500">Carregando overview organizacional...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total de colaboradores', value: metrics.totalMembers, icon: Users, accent: 'text-slate-900' },
          { label: 'Usuários ativos', value: metrics.activeMembers, icon: ShieldCheck, accent: 'text-emerald-700' },
          { label: 'Usuários inativos', value: metrics.inactiveMembers, icon: Activity, accent: 'text-rose-700' },
          { label: 'Convites pendentes', value: metrics.pendingInvitations, icon: Mail, accent: 'text-amber-700' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{metric.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{metric.value}</p>
              </div>
              <metric.icon className={`${metric.accent} opacity-80`} size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Equipes', value: metrics.teams },
          { label: 'Departamentos', value: metrics.departments },
          { label: 'Gestores', value: metrics.managers },
          { label: 'Workspace Health', value: `${metrics.healthScore}%` },
        ].map((metric) => (
          <div key={metric.label} className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{metric.label}</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_.85fr] gap-6">
        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Saúde organizacional</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">Workspace Health Score</h3>
            </div>
            <ArrowUpRight className="text-slate-400" size={18} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 items-center">
            <div className="rounded-[28px] bg-slate-950 text-white p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">Score atual</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black leading-none">{metrics.healthScore}</span>
                <span className="pb-1 text-sm font-bold text-white/70">/ 100</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${metrics.healthScore}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-black text-slate-900">Status:</span> {metrics.healthScore >= 85 ? 'Operação estável' : metrics.healthScore >= 75 ? 'Ativa com atenção' : 'Requer atenção imediata'}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-black text-slate-900">Ações prioritárias:</span> {metrics.noTeam > 0 ? `${metrics.noTeam} colaboradores sem equipe` : 'Sem pendências estruturais'}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-black text-slate-900">Onboarding:</span> {metrics.newThisMonth} novos colaboradores neste mês
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Crescimento da equipe</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">Entradas x Saídas</h3>
            </div>
            <ArrowUpRight className="text-slate-400" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#111827" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="team" stroke="#111827" strokeWidth={2.5} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Distribuição por departamentos</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">Organização atual</h3>
            </div>
            <Building2 className="text-slate-400" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={departmentShare} dataKey="value" nameKey="name" outerRadius={90} innerRadius={46} fill="#111827" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Distribuição por cargos</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">Perfil da companhia</h3>
            </div>
            <CircleDollarSign className="text-slate-400" size={18} />
          </div>
          <div className="space-y-3">
            {roleShare.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-bold text-slate-800">{item.name}</span>
                <span className="text-sm font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Atividade semanal</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">Sinais de operação</h3>
            </div>
            <CalendarRange className="text-slate-400" size={18} />
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Career Hub médio: <span className="font-black text-slate-900">{metrics.careerHub}</span></div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Novos colaboradores no mês: <span className="font-black text-slate-900">{metrics.newThisMonth}</span></div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Colaboradores sem equipe: <span className="font-black text-slate-900">{metrics.noTeam}</span></div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Colaboradores sem gestor: <span className="font-black text-slate-900">{metrics.noManager}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
