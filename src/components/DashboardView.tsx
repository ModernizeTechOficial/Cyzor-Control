import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProjects, useCompanies, useFinance, useMembers } from '../hooks/useCyzorQueries';
import { useNavigation } from '../context/NavigationContext';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { View } from '../types';
import HomeHeader from './home/HomeHeader';
import HomeKPIs from './home/HomeKPIs';
import HomeWorkspace from './home/HomeWorkspace';
import HomeAnalytics from './home/HomeAnalytics';
import OnboardingWizard from './OnboardingWizard';
import StrategicPriorityCard from './home/StrategicPriorityCard';
import BusinessInsightCard from './home/BusinessInsightCard';
import ProjectPulse from './home/ProjectPulse';
import { OperationalAlertCard } from './dashboard/OperationalAlertCard';
import { CompanyMaturityStatus } from './dashboard/CompanyMaturityStatus';
import { Sparkles, ArrowRight, Activity, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Zap, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getMaturityInfo, generateAIDiagnostics } from '../utils/besCalculator';

const RadarCustomTick = (props: any) => {
  const { payload, x, y, textAnchor } = props;
  const [label, percent] = payload.value.split('|');
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={0} textAnchor={textAnchor} fill="#0F172A" fontSize={11} fontWeight={700}>
        {label}
      </text>
      <text x={0} y={16} dy={0} textAnchor={textAnchor} fill="#2563EB" fontSize={11} fontWeight={700}>
        {percent}
      </text>
    </g>
  );
};

export default function DashboardView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth } = useAuth();
  const { globalFilters } = useNavigation();
  
  const [metrics, setMetrics] = useState({
    companies: 0,
    products: 0,
    projects: 0,
    clients: 0,
    revenue: 0,
    tasks: 0
  });
  
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects();
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();
  const { data: financeData } = useFinance();
  const { data: membersData } = useMembers();

  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);
  const [deploys, setDeploys] = useState<any[]>([]);
  const [finance, setFinance] = useState<any[]>([]);
  useEffect(() => { if (financeData) setFinance(financeData); }, [financeData]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => { if (membersData) setMembers(membersData); }, [membersData]);
  const [agendaEvents, setAgendaEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => { if (companiesData) setClients(companiesData); }, [companiesData]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!activeWorkspace) return;
    try {
      const [compRes, prodRes, projRes, finRes, depRes, taskRes, memberRes, agendaRes, clientRes, ideasRes, notifRes] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/products'),
        fetchWithAuth('/api/projects'),
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/deploys'),
        fetchWithAuth('/api/tasks'),
        fetchWithAuth('/api/workspace/members'),
        fetchWithAuth('/api/agenda'),
        fetchWithAuth('/api/clients'),
        fetchWithAuth('/api/ideas'),
        fetchWithAuth('/api/notifications')
      ]);

      const [companies, productsData, projectsData, financeData, deploysData, tasksData, membersData, agendaData, clientsData, ideasData, notifData] = await Promise.all([
        compRes.ok ? compRes.json() : [],
        prodRes.ok ? prodRes.json() : [],
        projRes.ok ? projRes.json() : [],
        finRes.ok ? finRes.json() : [],
        depRes.ok ? depRes.json() : [],
        taskRes.ok ? taskRes.json() : [],
        memberRes.ok ? memberRes.json() : [],
        agendaRes.ok ? agendaRes.json() : [],
        clientRes.ok ? clientRes.json() : [],
        ideasRes && ideasRes.ok ? ideasRes.json() : [],
        notifRes && notifRes.ok ? notifRes.json() : []
      ]);

      setProjects(projectsData);
      setDeploys(deploysData);
      setFinance(financeData);
      setTasks(tasksData);
      setMembers(membersData);
      setAgendaEvents(agendaData);
      setClients(clientsData);
      setProductsList(productsData);
      setIdeas(ideasData);
      setNotifications(notifData);

      const totalRevenue = financeData
        .filter((f: any) => f.type === 'RECEITA')
        .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

      setMetrics({
        companies: companies.length,
        products: productsData.length,
        projects: projectsData.length,
        clients: clientsData.length,
        revenue: Number(totalRevenue / 1000),
        tasks: tasksData.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [activeWorkspace]);

  // Filtered data based on globalFilters.companyId
  const { filteredProjects, filteredTasks, filteredAgendaEvents, filteredFinance, filteredMetrics } = useMemo(() => {
    const companyId = globalFilters.companyId;

    if (!companyId) {
      const totalRev = finance.filter((f: any) => f.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return {
        filteredProjects: projects,
        filteredTasks: tasks,
        filteredAgendaEvents: agendaEvents,
        filteredFinance: finance,
        filteredMetrics: {
          companies: companiesData?.length || 0,
          products: metrics.products,
          projects: projects.length,
          clients: clients.length,
          revenue: Number(totalRev / 1000),
          tasks: tasks.length
        }
      };
    }

    const companyIdStr = companyId.toString();
    const projFiltered = projects.filter((p: any) => p.companyId?.toString() === companyIdStr);
    const projIds = projFiltered.map((p: any) => p.id);

    const tasksFiltered = tasks.filter((t: any) => 
      t.companyId?.toString() === companyIdStr || 
      (t.projectId && projIds.includes(t.projectId))
    );

    const agendaFiltered = agendaEvents.filter((e: any) => 
      e.companyId?.toString() === companyIdStr ||
      (e.projectId && projIds.includes(e.projectId)) ||
      (e.linkedProject && projIds.includes(e.linkedProject.id))
    );

    const financeFiltered = finance.filter((f: any) => f.companyId?.toString() === companyIdStr);
    const totalRev = financeFiltered.filter((f: any) => f.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      filteredProjects: projFiltered,
      filteredTasks: tasksFiltered,
      filteredAgendaEvents: agendaFiltered,
      filteredFinance: financeFiltered,
      filteredMetrics: {
        companies: 1,
        products: projFiltered.length > 0 ? Array.from(new Set(projFiltered.map((p: any) => p.productId).filter(Boolean))).length : 0,
        projects: projFiltered.length,
        clients: clients.filter((c: any) => c.companyId?.toString() === companyIdStr || c.id?.toString() === companyIdStr).length,
        revenue: Number(totalRev / 1000),
        tasks: tasksFiltered.length
      }
    };
  }, [globalFilters.companyId, projects, tasks, agendaEvents, finance, metrics.products, companiesData, clients]);

  // Command Center - Calculate active risks
  const activeAlerts = useMemo(() => {
    const alerts: any[] = [];
    const today = new Date();
    
    // 1. Overdue projects
    projects.forEach((proj: any) => {
      if (proj.dueDate && new Date(proj.dueDate) < today && (proj.progress || 0) < 100 && proj.status !== 'Concluido' && proj.status !== 'CONCLUÍDO') {
        const daysOverdue = Math.ceil((today.getTime() - new Date(proj.dueDate).getTime()) / (1000 * 3600 * 24));
        alerts.push({
          id: `proj-overdue-${proj.id}`,
          type: 'danger',
          title: `Projeto Atrasado: ${proj.name}`,
          desc: `O prazo de entrega venceu há ${daysOverdue} dias. Progresso atual: ${proj.progress || 0}%.`,
          actionLabel: 'Ver Projetos',
          action: () => setCurrentView('projetos')
        });
      }
    });

    // 2. High priority tasks pending
    const highTasks = tasks.filter((t: any) => t.priority === 'Alta' && t.column !== 'done' && t.column !== 'concluido' && t.status !== 'DONE');
    if (highTasks.length > 2) {
      alerts.push({
        id: 'high-tasks-alert',
        type: 'warning',
        title: 'Acúmulo de Tarefas Críticas',
        desc: `Existem ${highTasks.length} tarefas de prioridade Alta aguardando conclusão no backlog do Kanban.`,
        actionLabel: 'Ver Backlog',
        action: () => setCurrentView('projetos')
      });
    }

    // 3. Financial alert
    const expenses = finance.filter((f: any) => f.type === 'DESPESA');
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalRevenue = finance.filter((f: any) => f.type === 'RECEITA').reduce((sum, e) => sum + Number(e.amount || 0), 0);
    if (totalExpenses > totalRevenue && totalExpenses > 0) {
      alerts.push({
        id: 'cashflow-alert',
        type: 'warning',
        title: 'Controle de Caixa Ativo',
        desc: `Despesas do período (R$ ${totalExpenses.toLocaleString('pt-BR')}) superam as receitas (R$ ${totalRevenue.toLocaleString('pt-BR')}).`,
        actionLabel: 'Financeiro',
        action: () => setCurrentView('financeiro')
      });
    }

    // Default informative alerts if none are critical
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear',
        type: 'success',
        title: 'Sinal Verde: Operações Estáveis',
        desc: 'Todos os projetos e finanças estão operando dentro dos parâmetros recomendados pela Cyzor IA.',
        actionLabel: 'Acessar IA',
        action: () => setCurrentView('ia')
      });
    }

    return alerts;
  }, [projects, tasks, finance]);

  // BES Calculation
  const besScore = activeWorkspace?.settings?.besScore || 120;
  
  const entitiesCount = {
    companies: companiesData?.length || 0,
    projects: projectsData?.length || 0,
    products: 0,
    tasks: 0,
    financeEntries: financeData?.length || 0,
    clients: 0 
  };
  
  const { currentStage, nextStage, progress, pointsToNext } = getMaturityInfo(besScore);
  const { diagnostics, recommendations, reasons } = generateAIDiagnostics(besScore, entitiesCount);

  const isOnboardingCompleted = activeWorkspace?.settings?.onboardingCompleted === true;
  const stage = currentStage.label || 'Ideia';

  if (activeWorkspace && !isOnboardingCompleted) {
    return (
      <div className="w-full mx-auto py-2">
        <OnboardingWizard onComplete={() => {
          sessionStorage.setItem('just_finished_onboarding', 'true');
          sessionStorage.setItem('welcome_modal_shown', 'true');
          window.dispatchEvent(new Event('restart-tour'));
        }} />
      </div>
    );
  }

  const isGrowthScale = ['Produto', 'Clientes', 'Financeiro', 'Crescimento', 'Gestão', 'Operação', 'Escala'].includes(stage);

  return (
    <div id="main-dashboard" className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-8">
      {/* Ambient background decorations for premium feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      {/* Header Section */}
      <HomeHeader />

      {/* COMMAND CENTER EXECUTIVE PANEL */}
      <div className="grid grid-cols-12 gap-6">
        {/* BES Maturity Meter Card (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
          <CompanyMaturityStatus 
            progress={progress}
            besScore={besScore}
            currentStage={currentStage}
            nextStage={nextStage}
            pointsToNext={pointsToNext}
            recommendations={recommendations}
            onRoadmapClick={() => setCurrentView('roadmap')}
          />
        </div>

        {/* Actionable Risk and Overdue Alerts Card (4 columns) */}
        <div className="col-span-12 lg:col-span-4 bg-[#F8FAFC]/40 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col justify-between group overflow-hidden relative">
          {/* Subtle background texture for premium feel */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-50/20 transition-colors duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-900 flex items-center justify-center shadow-sm group-hover:border-rose-100 transition-colors">
                  <ShieldAlert size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 leading-none">Risk Center</span>
                  <h4 className="text-sm font-display font-black text-slate-800 tracking-tight leading-none">Alertas Operacionais</h4>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Ativo</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
              {activeAlerts.map((alert: any, idx: number) => (
                <OperationalAlertCard key={idx} alert={alert} idx={idx} />
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-0.5">Diagnóstico</span>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-900">SISTEMA RESILIENTE</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
               <ShieldCheck size={10} className="text-indigo-600" />
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">CYZOR SECURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics and Metrics Grid */}
      <div className="grid grid-cols-12 gap-6 w-full">
        {/* KPI Grid (Full Width) */}
        <div className="col-span-12">
            <HomeKPIs metrics={filteredMetrics} setCurrentView={setCurrentView} />
        </div>

        {/* Main Chart Area (8 columns) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#F8FAFC]/40 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col h-full min-h-[400px]">
              <div className="flex-1 w-full">
                <HomeAnalytics financeEntries={filteredFinance} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8FAFC]/40 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <ProjectPulse projects={filteredProjects} />
              </div>
              <div className="bg-[#F8FAFC]/40 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck size={160} />
                </div>
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-1">Segurança</span>
                      <h3 className="text-sm font-display font-black text-slate-800 leading-none">Garantia Cyzor IA</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
                    Monitoramento contínuo por algoritmos de proteção avançada. Seus dados estão criptografados e protegidos.
                  </p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100/50 shadow-sm">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Protocolo Ativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Secondary Widgets Sidebar (4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Real-time Operational Feed */}
            <div className="bg-[#0F172A] border border-white/5 rounded-[40px] p-8 shadow-2xl flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 text-indigo-400 flex items-center justify-center border border-white/10 shadow-lg">
                    <Clock size={20} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-1 leading-none">Fluxo</span>
                    <h4 className="text-sm font-display font-black text-white leading-none">Eventos Operação</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar-dark relative z-10">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Activity className="w-10 h-10 text-white/5 mb-4" />
                    <p className="text-xs font-medium text-white/20">Aguardando novos eventos...</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className="flex gap-4 items-start group/item transition-all hover:translate-x-1">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-[0_0_10px] ${
                        notif.type === 'error' ? 'bg-rose-500 shadow-rose-500/50' : notif.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-indigo-500 shadow-indigo-500/50'
                      }`} />
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-sm font-black text-white/90 group-hover/item:text-indigo-400 transition-colors">{notif.title}</span>
                        <span className="text-xs text-white/40 leading-relaxed font-medium">{notif.description}</span>
                        <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => setCurrentView('ia')}
                className="mt-8 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2 group-hover:border-indigo-500/50 relative z-10"
              >
                Acessar Histórico <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#F8FAFC]/40 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <StrategicPriorityCard 
                  setCurrentView={setCurrentView} 
                  currentStage={stage}
                  ideas={ideas}
                  projects={filteredProjects}
                  products={productsList}
                  clients={clients}
                  finance={filteredFinance}
                  tasks={filteredTasks}
                />
              </div>
              <div className="bg-[#F8FAFC]/40 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <BusinessInsightCard setCurrentView={setCurrentView} currentStage={stage} />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
