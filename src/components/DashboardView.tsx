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
import GuidedJourneyPanel from './GuidedJourneyPanel';

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
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!activeWorkspace) return;
    try {
      const [compRes, prodRes, projRes, finRes, depRes, taskRes, memberRes, agendaRes, clientRes, ideasRes] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/products'),
        fetchWithAuth('/api/projects'),
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/deploys'),
        fetchWithAuth('/api/tasks'),
        fetchWithAuth('/api/workspace/members'),
        fetchWithAuth('/api/agenda'),
        fetchWithAuth('/api/clients'),
        fetchWithAuth('/api/ideas')
      ]);

      const [companies, productsData, projectsData, financeData, deploysData, tasksData, membersData, agendaData, clientsData, ideasData] = await Promise.all([
        compRes.ok ? compRes.json() : [],
        prodRes.ok ? prodRes.json() : [],
        projRes.ok ? projRes.json() : [],
        finRes.ok ? finRes.json() : [],
        depRes.ok ? depRes.json() : [],
        taskRes.ok ? taskRes.json() : [],
        memberRes.ok ? memberRes.json() : [],
        agendaRes.ok ? agendaRes.json() : [],
        clientRes.ok ? clientRes.json() : [],
        ideasRes && ideasRes.ok ? ideasRes.json() : []
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

  const isOnboardingCompleted = activeWorkspace?.settings?.onboardingCompleted === true;
  const currentStage = activeWorkspace?.settings?.stage || 'Ideia';

  if (activeWorkspace && !isOnboardingCompleted) {
    return (
      <div className="w-full mx-auto py-2">
        <OnboardingWizard onComplete={() => {}} />
      </div>
    );
  }

  // Define layout categories:
  // 1. Discovery (Ideia, Validação)
  // 2. Construction (Projeto, Planejamento, Desenvolvimento)
  // 3. Growth & Scale (Produto, Clientes, Financeiro, Crescimento, Gestão)
  const isConstruction = ['Projeto', 'Planejamento', 'Desenvolvimento'].includes(currentStage);
  const isGrowthScale = ['Produto', 'Clientes', 'Financeiro', 'Crescimento', 'Gestão'].includes(currentStage);

  return (
    <div id="main-dashboard" className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      {/* Header and Strategic Guided Journey (Full Width) */}
      <div className="flex flex-col gap-8">
        <HomeHeader />
        
        <GuidedJourneyPanel 
          setCurrentView={setCurrentView} 
          metrics={filteredMetrics} 
          projects={filteredProjects}
          products={productsList}
          ideas={ideas}
          clients={clients}
          finance={filteredFinance}
          tasks={filteredTasks}
          onRefreshData={fetchDashboardData}
        />
      </div>

      {/* Dynamic Widget Grid prioritized by Maturity Stage */}
      <div className="flex flex-col gap-8 w-full">
        {isConstruction ? (
          <>
            {/* For construction stages: Workspace (tasks/agenda) takes highest priority */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#0F172A05] pb-2">
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Foco Operacional: Cronograma e Execução</h3>
                <span className="text-[11px] text-[#64748B] font-medium">Estágio de Construção Ativo: {currentStage}</span>
              </div>
              <HomeWorkspace projects={filteredProjects} tasks={filteredTasks} agendaEvents={filteredAgendaEvents} setCurrentView={setCurrentView} />
            </div>

            <HomeKPIs metrics={filteredMetrics} setCurrentView={setCurrentView} />
            <HomeAnalytics financeEntries={filteredFinance} />
          </>
        ) : isGrowthScale ? (
          <>
            {/* For scale & financial stages: KPIs and Analytics are highest priority */}
            <HomeKPIs metrics={filteredMetrics} setCurrentView={setCurrentView} />
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#0F172A05] pb-2">
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Desempenho Comercial & Tração</h3>
                <span className="text-[11px] text-[#64748B] font-medium">Estágio de Crescimento Ativo: {currentStage}</span>
              </div>
              <HomeAnalytics financeEntries={filteredFinance} />
            </div>

            <HomeWorkspace projects={filteredProjects} tasks={filteredTasks} agendaEvents={filteredAgendaEvents} setCurrentView={setCurrentView} />
          </>
        ) : (
          <>
            {/* Default / Discovery Stage priority */}
            <HomeKPIs metrics={filteredMetrics} setCurrentView={setCurrentView} />
            <HomeWorkspace projects={filteredProjects} tasks={filteredTasks} agendaEvents={filteredAgendaEvents} setCurrentView={setCurrentView} />
            <HomeAnalytics financeEntries={filteredFinance} />
          </>
        )}
      </div>
    </div>
  );
}
