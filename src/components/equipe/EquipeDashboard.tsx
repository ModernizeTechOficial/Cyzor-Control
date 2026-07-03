import { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  UserPlus,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMembers, useProjects } from '../../hooks/useCyzorQueries';
import { SkeletonDashboard } from '../common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EquipeDashboard() {
  const { fetchWithAuth } = useAuth();
  const [stats, setStats] = useState({
    members: 0,
    activeInvitations: 0,
    actionsToday: 0,
    securityIncidents: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersRes, invRes, logsRes] = await Promise.all([
          fetchWithAuth('/api/workspace/members'),
          fetchWithAuth('/api/workspace/invitations'),
          fetchWithAuth('/api/workspace/audit-logs')
        ]);

        if (membersRes.ok && invRes.ok && logsRes.ok) {
          const members = await membersRes.json();
          const invitations = await invRes.json();
          const logs = await logsRes.json();

          setStats({
            members: members.length,
            activeInvitations: invitations.filter((i: any) => i.status === 'PENDING').length,
            actionsToday: logs.length, // Simplified for now
            securityIncidents: 0
          });
          setRecentActions(logs.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = [
    { name: 'Seg', actions: 12 },
    { name: 'Ter', actions: 19 },
    { name: 'Qua', actions: 15 },
    { name: 'Qui', actions: 22 },
    { name: 'Sex', actions: 30 },
    { name: 'Sab', actions: 10 },
    { name: 'Dom', actions: 8 },
  ];

  if (loading) return <div className="p-8 text-center text-[#64748B]">Carregando estatísticas...</div>;

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Membros Ativos" 
          value={stats.members.toString()} 
          icon={Users} 
          color="blue"
          trend="+2 este mês"
        />
        <StatCard 
          label="Convites Pendentes" 
          value={stats.activeInvitations.toString()} 
          icon={Mail} 
          color="amber"
          trend="Expira em 7 dias"
        />
        <StatCard 
          label="Ações (24h)" 
          value={stats.actionsToday.toString()} 
          icon={Activity} 
          color="emerald"
          trend="+12% vs ontem"
        />
        <StatCard 
          label="Nível de Segurança" 
          value="Máximo" 
          icon={ShieldCheck} 
          color="indigo"
          trend="Auditado"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white border border-[#0F172A0F] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#111111] tracking-tight">Atividade da Equipe</h3>
              <p className="text-sm text-[#64748B] font-medium">Frequência de interações no workspace</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
              <TrendingUp size={14} /> +24% este período
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px'}}
                  itemStyle={{fontWeight: 'bold', fontSize: '13px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="actions" 
                  stroke="#111111" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#0F172A0F] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">Atividade Recente</h3>
            <button className="text-[11px] font-bold text-[#64748B] hover:text-[#111111] uppercase tracking-widest transition-colors flex items-center gap-1.5">
              Ver Tudo <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {recentActions.map((action: any) => (
              <div key={action.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-[#0F172A05] flex items-center justify-center flex-shrink-0 text-[#111111] font-bold text-xs">
                  {action.userName?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-[#111111]">
                    {action.userName} <span className="font-medium text-[#64748B]">realizou</span> {action.action}
                  </p>
                  <p className="text-xs text-[#64748B] font-medium flex items-center gap-1.5">
                    <Clock size={12} /> {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 rounded-2xl bg-[#FAFAFA] border border-[#0F172A05] text-sm font-bold text-[#111111] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 group">
            <UserPlus size={16} className="group-hover:scale-110 transition-transform" /> Convidar Membro
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest group-hover:text-[#111111] transition-colors">{trend}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-display font-bold text-[#111111] tracking-tight">{value}</span>
        <span className="text-sm font-bold text-[#64748B] tracking-tight uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return <ExternalLink {...props} />;
}
