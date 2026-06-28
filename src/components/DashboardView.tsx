import { useState, useEffect } from 'react';
import { Building2, Package, Lightbulb, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { View } from '../types';

import DashboardHero from './dashboard/DashboardHero';
import KPISection from './dashboard/KPISection';
import AICenter from './dashboard/AICenter';
import BusinessOverview from './dashboard/BusinessOverview';
import ProjectCards from './dashboard/ProjectCards';
import PriorityCenter from './dashboard/PriorityCenter';
import ActivityTimeline from './dashboard/ActivityTimeline';
import KanbanCompact from './dashboard/KanbanCompact';
import FeaturedIdeas from './dashboard/FeaturedIdeas';
import AlertsPanel from './dashboard/AlertsPanel';
import QuickActions from './dashboard/QuickActions';
import WorkspaceStatus from './dashboard/WorkspaceStatus';

export default function DashboardView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth, token } = useAuth();
  const [metrics, setMetrics] = useState({
    companies: 0,
    projects: 0,
    ideas: 0,
    revenue: 0,
    members: 0,
    icons: { Building2, Package, Lightbulb, CreditCard }
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [businessHealth, setBusinessHealth] = useState<any[]>([]);
  const [workspaceStats, setWorkspaceStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeWorkspace) return;
      try {
        const [compRes, projRes, ideasRes, finRes, insightRes, notifRes, taskRes, wsRes] = await Promise.all([
          fetchWithAuth('/api/companies'),
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/ideas'),
          fetchWithAuth('/api/finance'),
          fetchWithAuth('/api/ai/insights'),
          fetchWithAuth('/api/notifications'),
          fetchWithAuth('/api/tasks'),
          fetchWithAuth('/api/workspace-settings')
        ]);

        const [companies, projectsData, ideasData, finance, insightData, notifications, tasksData, wsData] = await Promise.all([
          compRes.ok ? compRes.json() : [],
          projRes.ok ? projRes.json() : [],
          ideasRes.ok ? ideasRes.json() : [],
          finRes.ok ? finRes.json() : [],
          insightRes.ok ? insightRes.json() : null,
          notifRes.ok ? notifRes.json() : [],
          taskRes.ok ? taskRes.json() : [],
          wsRes.ok ? wsRes.json() : null
        ]);

        const totalRevenue = finance
          .filter((f: any) => f.type === 'RECEITA')
          .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

        setMetrics({
          companies: companies.length,
          projects: projectsData.length,
          ideas: ideasData.length,
          revenue: totalRevenue,
          members: wsData?.stats?.members || 0,
          icons: { Building2, Package, Lightbulb, CreditCard }
        });

        setWorkspaceStats(wsData?.stats);

        setProjects(projectsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status || 'Em Desenvolvimento',
          progress: p.progress || 0,
          members: Array.isArray(p.team) ? p.team.length : 2,
          deadline: p.dueDate ? new Date(p.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'
        })).slice(0, 3));

        setIdeas(ideasData.map((i: any) => ({
          id: i.id,
          name: i.title,
          score: i.priority === 'Alta' ? 95 : 80,
          potential: 'Alto',
          status: i.status || 'Validação'
        })).slice(0, 4));

        setInsights(insightData);
        
        setActivities(notifications.map((n: any) => ({
          id: n.id,
          user: n.title.split(' ')[0] || 'Sistema',
          action: n.description,
          time: new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: n.type
        })).slice(0, 4));

        setTasks(tasksData);

        // Calculate Business Health Stats
        const projectScore = projectsData.length > 0 
          ? Math.round(projectsData.reduce((acc: number, p: any) => acc + (p.progress || 0), 0) / projectsData.length)
          : 90;
        
        const financeScore = totalRevenue > 0 ? 95 : 50;
        const taskScore = tasksData.length > 0
          ? Math.round((tasksData.filter((t: any) => t.status === 'DONE').length / tasksData.length) * 100)
          : 85;

        const businessStats = [
          { label: "Receita", score: financeScore, trend: 'up', trendValue: '+12%', spark: [{value: 30}, {value: 45}, {value: 40}, {value: 60}, {value: 55}, {value: 70}] },
          { label: "Projetos", score: projectScore, trend: 'up', trendValue: '+5%', spark: [{value: 40}, {value: 35}, {value: 50}, {value: 45}, {value: 60}, {value: 55}] },
          { label: "Deploy", score: 92, trend: 'up', trendValue: 'Stable', spark: [{value: 50}, {value: 55}, {value: 52}, {value: 58}, {value: 60}, {value: 62}] },
          { label: "Equipe", score: taskScore, trend: 'up', trendValue: '+2%', spark: [{value: 30}, {value: 40}, {value: 35}, {value: 45}, {value: 40}, {value: 50}] },
          { label: "Performance", score: 88, trend: 'down', trendValue: '-3%', spark: [{value: 70}, {value: 65}, {value: 68}, {value: 60}, {value: 55}, {value: 50}] },
          { label: "IA Score", score: 94, trend: 'up', trendValue: '+1.4', spark: [{value: 40}, {value: 50}, {value: 45}, {value: 60}, {value: 65}, {value: 70}] },
        ];
        
        setBusinessHealth(businessStats);

      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, [token, activeWorkspace]);

  const kpis = [
    { label: 'Projetos Ativos', value: metrics.projects, change: '+12%', type: 'projects', icon: Building2 },
    { label: 'Ideias em Validação', value: metrics.ideas, change: '+5%', type: 'ideas', icon: Lightbulb },
    { label: 'Empresas Ativas', value: metrics.companies, change: '+2', type: 'companies', icon: Package },
    { label: 'Receita Operacional', value: `R$ ${(metrics.revenue / 1000).toFixed(1)}k`, change: '+18%', type: 'revenue', icon: CreditCard },
  ];

  const aiInsights = [
    { id: '1', type: 'high' as const, message: insights?.risk || 'Analisando riscos operacionais...', time: 'Real-time' },
    { id: '2', type: 'medium' as const, message: insights?.opportunity || 'Buscando oportunidades...', time: 'Real-time' },
    { id: '3', type: 'low' as const, message: insights?.recommendation || 'Gerando recomendações...', time: 'Real-time' },
  ];

  const priorityItems = tasks
    .filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL')
    .map(t => ({
      id: t.id.toString(),
      title: t.title,
      category: (t.priority === 'CRITICAL' ? 'Critical' : 'Task') as 'Decision' | 'Critical' | 'Task' | 'Risk',
      priority: (t.priority === 'CRITICAL' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
      tag: t.status
    })).slice(0, 4);

  const alerts = activities
    .filter(a => a.type === 'error' || a.type === 'warning' || a.type === 'ai')
    .map(a => ({
      id: a.id.toString(),
      category: (a.type === 'error' ? 'Infraestrutura' : 'Projetos') as 'Financeiro' | 'Projetos' | 'Clientes' | 'Infraestrutura',
      message: a.action,
      time: a.time
    }));

  const kanbanColumns = [
    { title: 'A Fazer', tasks: tasks.filter(t => t.status === 'TODO').slice(0, 2).map(t => ({ id: t.id.toString(), title: t.title, category: 'Task', time: 'Pendente' })) },
    { title: 'Em Progresso', tasks: tasks.filter(t => t.status === 'IN_PROGRESS').slice(0, 2).map(t => ({ id: t.id.toString(), title: t.title, category: 'Task', time: 'Ativo' })) },
    { title: 'Concluído', tasks: tasks.filter(t => t.status === 'DONE').slice(0, 2).map(t => ({ id: t.id.toString(), title: t.title, category: 'Task', time: 'Finalizado' })) },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <DashboardHero 
        stats={{
          activeProjects: metrics.projects,
          pendingDecisions: tasks.filter(t => t.status === 'TODO').length,
          criticalRisks: tasks.filter(t => t.priority === 'CRITICAL').length,
          productivity: "+12%"
        }}
        aiMessage={insights?.summary || "A operação está sendo analisada pela IA Olimpo..."}
        onOpenAI={() => setCurrentView('ia')}
        onResolve={() => {}}
      />

      {/* 2. KPI SECTION + QUICK ACTIONS */}
      <div className="flex flex-col gap-6">
        <KPISection metrics={metrics} />
        <QuickActions setCurrentView={setCurrentView} />
      </div>

      {/* 3. BUSINESS OVERVIEW + AI COLUMN (GRID 8/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8">
          <BusinessOverview stats={businessHealth} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
           <AICenter 
             insights={aiInsights} 
             onResolve={() => {}}
           />
           <ActivityTimeline 
              activities={activities}
            />
        </div>
      </div>

      {/* 4. PROJECTS (FULL WIDTH) */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight">Projetos em Destaque</h3>
            <p className="text-[12px] font-medium text-[#64748B]">Acompanhamento técnico em tempo real.</p>
          </div>
          <button onClick={() => setCurrentView('projetos')} className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
            Explorar Todos
          </button>
        </div>
        <ProjectCards projects={projects} />
      </div>

      {/* 5. PRIORITIES + WORKSPACE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight">Prioridades Estratégicas</h3>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Live Priority Feed</span>
            </div>
          </div>
          <PriorityCenter 
            items={priorityItems.length > 0 ? (priorityItems as any) : [
              { id: '1', title: 'Nenhuma prioridade crítica no momento', category: 'Task', priority: 'low', tag: 'Safe' }
            ]}
          />
        </div>
        <div className="lg:col-span-4">
           <WorkspaceStatus stats={workspaceStats} />
        </div>
      </div>

      {/* 6. KANBAN (FULL WIDTH) */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight px-2">Fluxo de Entregas</h3>
        <KanbanCompact 
          columns={kanbanColumns}
        />
      </div>

      {/* 7. IDEAS + ALERTS (GRID 8/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight px-2">Product Sandbox</h3>
          <FeaturedIdeas ideas={ideas} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight px-2">Governança</h3>
          <AlertsPanel 
            alerts={alerts.length > 0 ? (alerts as any) : [
              { id: '1', category: 'Projetos', message: 'Nenhum alerta crítico detectado', time: 'Now' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
