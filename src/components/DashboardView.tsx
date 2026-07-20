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
import { Sparkles, ArrowRight, Activity, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Zap, Target, TrendingUp } from 'lucide-react';
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
    <div id="main-dashboard" className="w-full mx-auto pb-12 flex flex-col gap-8 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      {/* Header (Full Width) */}
      <HomeHeader />

      {/* COMMAND CENTER EXECUTIVE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* BES Maturity Meter Card */}
        <div className="lg:col-span-2 bg-white border border-[#0F172A0F] rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <span className="text-[10px] font-black uppercase text-[#64748B] tracking-wider font-display flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Maturidade Operacional (BES)
            </span>
            <button 
              onClick={() => setCurrentView('roadmap')}
              className="hidden md:inline-flex bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors gap-1.5 items-center font-display"
            >
              Planejamento Estratégico <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative z-10 w-full mb-8">
            <div className="flex-1 flex flex-col justify-center border-r border-[#0F172A05] pr-8">
               <h4 className="text-xl font-display font-black text-[#111111] mb-1">{currentStage.label}</h4>
               <p className="text-xs font-bold text-[#64748B] mb-6">{currentStage.role}</p>

               <div className="flex items-baseline gap-2 mb-2 font-display">
                 <span className="text-5xl font-black text-blue-600 tracking-tight">{progress}%</span>
               </div>
               
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                 <div 
                   className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                   style={{ width: `${progress}%` }} 
                 />
               </div>
               
               <p className="text-[10px] font-bold text-slate-400 mt-1">
                 Score atual: <strong className="text-slate-600">{besScore.toLocaleString()} pontos</strong>
               </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-display font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                 <Target className="w-3.5 h-3.5 text-slate-500" /> Próximo Objetivo
               </h4>
               {nextStage ? (
                 <>
                   <p className="text-sm font-bold text-[#111111] mb-2">Chegar ao estágio de {nextStage.label}.</p>
                   <p className="text-xs font-medium text-slate-600 mb-4 leading-relaxed">
                     Para atingir este marco e desbloquear novas análises da IA, você precisa acumular mais <strong>{pointsToNext.toLocaleString()} pontos BES</strong> através de execução operacional.
                   </p>
                   
                   <div className="space-y-2">
                     {recommendations.slice(0, 2).map((rec: any, idx: number) => (
                       <div key={idx} className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                         <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                         <div className="flex-1 min-w-0">
                           <p className="text-[11px] font-bold text-slate-700 truncate">{rec.title}</p>
                           <p className="text-[9px] font-black text-blue-600 tracking-wider uppercase mt-0.5">{rec.impact}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               ) : (
                 <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 h-full flex flex-col justify-center">
                   <p className="text-sm font-bold mb-1">Maturidade Máxima</p>
                   <p className="text-xs">Sua empresa atingiu o nível mais alto de maturidade no ecossistema.</p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start relative z-10">
             <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
               <Sparkles className="w-4 h-4 text-blue-600" />
             </div>
             <div>
               <p className="text-xs font-medium text-slate-700 leading-relaxed">
                 <strong className="font-display font-black text-blue-900 mr-1">Diagnóstico:</strong>
                 {diagnostics}
               </p>
             </div>
          </div>
        </div>

        {/* Actionable Risk and Overdue Alerts Card */}
        <div className="lg:col-span-1 bg-white border border-[#0F172A0F] rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <h4 className="text-sm font-display font-black text-[#111111]">Alertas & Diagnóstico IA</h4>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[140px] pr-2">
              {activeAlerts.map((alert: any, idx: number) => (
                <div key={idx} className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                  alert.type === 'danger' 
                    ? 'bg-rose-50/50 border-rose-100 text-rose-950' 
                    : alert.type === 'warning'
                    ? 'bg-amber-50/50 border-amber-100 text-amber-950'
                    : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.type === 'danger' ? (
                      <AlertTriangle size={16} className="text-rose-500" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle size={16} className="text-amber-500" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-xs font-display font-black">{alert.title}</span>
                    <span className="text-[11px] text-[#64748B] leading-relaxed">{alert.desc}</span>
                  </div>
                  <button 
                    onClick={alert.action}
                    className="text-[10px] font-black underline flex-shrink-0 hover:text-black transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    {alert.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#0F172A05] flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Diagnóstico Operacional</span>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">100% Protegido</span>
          </div>
        </div>
      </div>

      {/* Dynamic Widget Grid */}
      <div className="grid grid-cols-12 gap-6 w-full">
        {/* KPI Row (Full Width) */}
        <div className="col-span-12">
            <HomeKPIs metrics={filteredMetrics} setCurrentView={setCurrentView} />
        </div>

        {/* Main Content Area (8 columns) */}
        <div className="col-span-12 md:col-span-8">
            {isGrowthScale ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between border-b border-[#0F172A05] pb-2">
                  <h3 className="text-xs font-display font-black text-[#64748B] uppercase tracking-wider">Desempenho Comercial & Tração</h3>
                  <span className="text-[11px] text-[#64748B] font-medium font-display">Estágio Ativo: {stage}</span>
                </div>
                <HomeAnalytics financeEntries={filteredFinance} />
              </div>
            ) : (
              <HomeAnalytics financeEntries={filteredFinance} />
            )}
        </div>

        {/* Sidebar Content Area (4 columns) */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4 h-full">
            {/* Real-time Event-driven operations feed */}
            <div className="bg-white border border-[#0F172A0F] rounded-[32px] p-6 shadow-sm flex flex-col gap-4 max-h-[350px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock size={14} className="animate-pulse" />
                  </div>
                  <h4 className="text-xs font-display font-black text-[#111111] uppercase tracking-wider">Feed Operacional (Eventos)</h4>
                </div>
                <span className="text-[10px] font-bold text-[#64748B]">Real-time</span>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs font-medium text-[#94A3B8]">Nenhum evento registrado ainda.</p>
                  </div>
                ) : (
                  notifications.slice(0, 4).map((notif: any) => (
                    <div key={notif.id} className="flex gap-3 items-start border-b border-[#0F172A03] pb-2.5 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === 'error' ? 'bg-rose-500 animate-ping' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 flex flex-col">
                        <span className="text-xs font-bold text-[#111111]">{notif.title}</span>
                        <span className="text-[10px] text-[#64748B] leading-relaxed">{notif.description}</span>
                        <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1">
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
            
            <div className="flex-1">
              <BusinessInsightCard setCurrentView={setCurrentView} currentStage={stage} />
            </div>

            {/* Global AI Intelligence Access Widget */}
            <div className="flex-1">
               <motion.div 
                whileHover={{ y: -2 }}
                onClick={() => setCurrentView('ia')}
                className="bg-white border border-[#0F172A0F] rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-display font-black text-[#111111]">Olimpo AI</h3>
                      <span className="text-[10px] font-display font-bold text-blue-600 uppercase tracking-widest">Operação por IA</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#111111] transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed mb-4">
                  Sua inteligência artificial está ativa e monitorando todos os dados do seu workspace em tempo real. Peça para a IA cadastrar registros ou atualizar status de projetos.
                </p>
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">DB</div>
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">AI</div>
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">360</div>
                   </div>
                   <span className="text-[10px] font-display font-black text-[#111111]">Operação Autônoma Ativa</span>
                </div>
               </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
}
