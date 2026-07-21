import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  useProjects, useCompanies, useFinance, useMembers, 
  useTasks, useAgenda, useClients, useProducts, 
  useIdeas, useNotifications 
} from '../hooks/useCyzorQueries';
import { useNavigation } from '../context/NavigationContext';
import { View } from '../types';
import HomeHeader from './home/HomeHeader';
import HomeKPIs from './home/HomeKPIs';
import HomeAnalytics from './home/HomeAnalytics';
import OnboardingWizard from './OnboardingWizard';
import StrategicPriorityCard from './home/StrategicPriorityCard';
import BusinessInsightCard from './home/BusinessInsightCard';
import ProjectPulse from './home/ProjectPulse';
import { OperationalAlertCard } from './dashboard/OperationalAlertCard';
import { CompanyMaturityStatus } from './dashboard/CompanyMaturityStatus';
import { ArrowRight, Activity, ShieldAlert, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { getProfessionalEvolutionInfo, generateProfessionalInsights } from '../utils/professionalEvolutionCalculator';

export default function DashboardView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace } = useAuth();
  const { globalFilters } = useNavigation();
  
  // Data Fetching using React Query Cache
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { data: companiesData = [], isLoading: isCompaniesLoading } = useCompanies();
  const { data: finance = [], isLoading: isFinanceLoading } = useFinance();
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks();
  const { data: agendaEvents = [] } = useAgenda();
  const { data: clients = [] } = useClients();
  const { data: productsList = [] } = useProducts();
  const { data: ideas = [] } = useIdeas();
  const { data: notifications = [] } = useNotifications();
  const { data: members = [] } = useMembers();

  // Metrics Logic
  const filteredMetrics = useMemo(() => {
    const companyId = globalFilters.companyId;
    if (!companyId) {
      const totalRev = finance.filter((f: any) => f.type === 'RECEITA').reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
      return {
        companies: companiesData.length,
        products: productsList.length,
        projects: projects.length,
        clients: clients.length,
        revenue: Number(totalRev / 1000),
        tasks: tasks.length
      };
    }

    const companyIdStr = companyId.toString();
    const projFiltered = projects.filter((p: any) => p.companyId?.toString() === companyIdStr);
    const tasksFiltered = tasks.filter((t: any) => 
      t.companyId?.toString() === companyIdStr || (t.projectId && projFiltered.some((p: any) => p.id === t.projectId))
    );
    const financeFiltered = finance.filter((f: any) => f.companyId?.toString() === companyIdStr);
    const totalRev = financeFiltered.filter((f: any) => f.type === 'RECEITA').reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

    return {
      companies: 1,
      products: projFiltered.length > 0 ? Array.from(new Set(projFiltered.map((p: any) => p.productId).filter(Boolean))).length : 0,
      projects: projFiltered.length,
      clients: clients.filter((c: any) => c.companyId?.toString() === companyIdStr || c.id?.toString() === companyIdStr).length,
      revenue: Number(totalRev / 1000),
      tasks: tasksFiltered.length
    };
  }, [globalFilters.companyId, projects, tasks, finance, productsList, companiesData, clients]);

  const { filteredProjects, filteredTasks, filteredFinance } = useMemo(() => {
    const companyId = globalFilters.companyId;
    if (!companyId) return { filteredProjects: projects, filteredTasks: tasks, filteredFinance: finance };
    
    const companyIdStr = companyId.toString();
    const projFiltered = projects.filter((p: any) => p.companyId?.toString() === companyIdStr);
    const tasksFiltered = tasks.filter((t: any) => 
      t.companyId?.toString() === companyIdStr || (t.projectId && projFiltered.some((p: any) => p.id === t.projectId))
    );
    const financeFiltered = finance.filter((f: any) => f.companyId?.toString() === companyIdStr);

    return { filteredProjects: projFiltered, filteredTasks: tasksFiltered, filteredFinance: financeFiltered };
  }, [globalFilters.companyId, projects, tasks, finance]);

  // Active Alerts Calculation
  const activeAlerts = useMemo(() => {
    const alerts: any[] = [];
    const today = new Date();
    
    projects.forEach((proj: any) => {
      if (proj.dueDate && new Date(proj.dueDate) < today && (proj.progress || 0) < 100 && proj.status !== 'Concluido' && proj.status !== 'CONCLUÍDO') {
        const daysOverdue = Math.ceil((today.getTime() - new Date(proj.dueDate).getTime()) / (1000 * 3600 * 24));
        alerts.push({
          id: `proj-overdue-${proj.id}`, type: 'danger', title: `Projeto Atrasado: ${proj.name}`,
          desc: `O prazo venceu há ${daysOverdue} dias. Progresso atual: ${proj.progress || 0}%.`,
          actionLabel: 'Ver Projetos', action: () => setCurrentView('projetos')
        });
      }
    });

    const highTasks = tasks.filter((t: any) => t.priority === 'Alta' && t.column !== 'done' && t.column !== 'concluido' && t.status !== 'DONE');
    if (highTasks.length > 2) {
      alerts.push({
        id: 'high-tasks-alert', type: 'warning', title: 'Acúmulo de Tarefas Críticas',
        desc: `Existem ${highTasks.length} tarefas de prioridade Alta aguardando conclusão no backlog.`,
        actionLabel: 'Ver Backlog', action: () => setCurrentView('projetos')
      });
    }

    const totalExpenses = finance.filter((f: any) => f.type === 'DESPESA').reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
    const totalRevenue = finance.filter((f: any) => f.type === 'RECEITA').reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
    if (totalExpenses > totalRevenue && totalExpenses > 0) {
      alerts.push({
        id: 'cashflow-alert', type: 'warning', title: 'Controle de Caixa Ativo',
        desc: `Despesas do período (R$ ${totalExpenses.toLocaleString('pt-BR')}) superam as receitas.`,
        actionLabel: 'Financeiro', action: () => setCurrentView('financeiro')
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear', type: 'success', title: 'Sinal Verde: Operações Estáveis',
        desc: 'Projetos e finanças estão operando dentro dos parâmetros recomendados.',
        actionLabel: 'Acessar IA', action: () => setCurrentView('ia')
      });
    }

    return alerts;
  }, [projects, tasks, finance]);

  // Professional evolution calculation
  const evolutionXp = activeWorkspace?.settings?.professionalEvolution?.xpTotal || activeWorkspace?.settings?.besScore || 120;
  const entitiesCount = {
    companies: companiesData.length,
    projects: projects.length,
    products: 0,
    tasks: 0,
    financeEntries: finance.length,
    clients: 0 
  };
  
  const { currentStage, nextStage, progress, xpToNext } = getProfessionalEvolutionInfo(evolutionXp);
  const { recommendations } = generateProfessionalInsights(evolutionXp, entitiesCount);
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

  return (
    <div id="main-dashboard" className="w-full mx-auto pb-12 flex flex-col gap-8 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-8">
      {/* Ambient background decorations for premium feel */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none -z-10" 
      />
      
      <HomeHeader />

      {/* COMMAND CENTER EXECUTIVE PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <CompanyMaturityStatus 
            progress={progress}
            evolutionXp={evolutionXp}
            currentStage={currentStage}
            nextStage={nextStage}
            xpToNext={xpToNext}
            recommendations={recommendations}
            onRoadmapClick={() => setCurrentView('roadmap')}
          />
        </div>

        <div className="xl:col-span-4 bg-white/60 backdrop-blur-md border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col group overflow-hidden relative transition-shadow hover:shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-100/50 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-900 flex items-center justify-center shadow-sm">
                  <ShieldAlert size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5">Risk Center</span>
                  <h4 className="text-sm font-display font-black text-slate-800 tracking-tight">Alertas Operacionais</h4>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Ativo</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar flex flex-col gap-2.5">
              {activeAlerts.map((alert: any, idx: number) => (
                <OperationalAlertCard key={idx} alert={alert} idx={idx} />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Diagnóstico</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black text-slate-900 uppercase">Sistema Resiliente</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                 <ShieldCheck size={12} className="text-indigo-600" />
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Cyzor Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics and Metrics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        <div className="xl:col-span-12">
            <HomeKPIs metrics={filteredMetrics} setCurrentView={setCurrentView} />
        </div>

        {/* Main Chart Area */}
        <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col h-full min-h-[400px]">
              <HomeAnalytics financeEntries={filteredFinance} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow">
                <ProjectPulse projects={filteredProjects} />
              </div>

              {/* Improved Cyzor IA Guarantee Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-6 shadow-lg shadow-indigo-500/20 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute -right-4 -bottom-4 opacity-[0.1] text-white group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck size={160} />
                </div>
                
                <div className="flex flex-col h-full relative z-10 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm backdrop-blur-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-indigo-200 tracking-[0.2em] leading-none mb-1">Segurança</span>
                      <h3 className="text-sm font-display font-black text-white leading-none">Garantia Cyzor IA</h3>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium mb-6">
                    Monitoramento contínuo por algoritmos de proteção avançada. A IA audita atividades e garante integridade dos dados 24/7.
                  </p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 backdrop-blur-sm">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">Protocolo Ativo</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
        </div>

        {/* Secondary Widgets Sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Redesigned Operational Feed (Light/Glassmorphism) */}
            <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[32px] p-6 shadow-sm flex flex-col h-full group relative overflow-hidden transition-shadow hover:shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                    <Clock size={18} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5 leading-none">Fluxo</span>
                    <h4 className="text-sm font-display font-black text-slate-800 leading-none">Eventos Operação</h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar relative z-10 max-h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-xs font-medium text-slate-400">Aguardando novos eventos...</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif: any) => (
                    <motion.div 
                      whileHover={{ x: 4 }}
                      key={notif.id} 
                      className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === 'error' ? 'bg-rose-500 shadow-sm shadow-rose-500/30' : 
                        notif.type === 'success' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 
                        'bg-indigo-500 shadow-sm shadow-indigo-500/30'
                      }`} />
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{notif.title}</span>
                        <span className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{notif.description}</span>
                        <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-1.5">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => setCurrentView('ia')}
                className="mt-6 w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 group/btn shadow-sm relative z-10"
              >
                Acessar Histórico <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow">
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
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow">
                <BusinessInsightCard setCurrentView={setCurrentView} currentStage={stage} />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
