import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProjects, useCompanies, useFinance, useMembers } from '../hooks/useCyzorQueries';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { View } from '../types';
import HomeHeader from './home/HomeHeader';
import HomeKPIs from './home/HomeKPIs';
import HomeWorkspace from './home/HomeWorkspace';
import HomeAnalytics from './home/HomeAnalytics';

export default function DashboardView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth } = useAuth();
  
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeWorkspace) return;
      try {
        const [compRes, prodRes, projRes, finRes, depRes, taskRes, memberRes, agendaRes, clientRes] = await Promise.all([
          fetchWithAuth('/api/companies'),
          fetchWithAuth('/api/products'),
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/finance'),
          fetchWithAuth('/api/deploys'),
          fetchWithAuth('/api/tasks'),
          fetchWithAuth('/api/workspace/members'),
          fetchWithAuth('/api/agenda'),
          fetchWithAuth('/api/clients')
        ]);

        const [companies, products, projectsData, financeData, deploysData, tasksData, membersData, agendaData, clientsData] = await Promise.all([
          compRes.ok ? compRes.json() : [],
          prodRes.ok ? prodRes.json() : [],
          projRes.ok ? projRes.json() : [],
          finRes.ok ? finRes.json() : [],
          depRes.ok ? depRes.json() : [],
          taskRes.ok ? taskRes.json() : [],
          memberRes.ok ? memberRes.json() : [],
          agendaRes.ok ? agendaRes.json() : [],
          clientRes.ok ? clientRes.json() : []
        ]);

        setProjects(projectsData);
        setDeploys(deploysData);
        setFinance(financeData);
        setTasks(tasksData);
        setMembers(membersData);
        setAgendaEvents(agendaData);
        setClients(clientsData);

        const totalRevenue = financeData
          .filter((f: any) => f.type === 'RECEITA')
          .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

        setMetrics({
          companies: companies.length,
          products: products.length,
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

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [activeWorkspace]);

  return (
    <div id="main-dashboard" className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      {/* Header and KPIs (Full Width) */}
      <div className="flex flex-col gap-8">
        <HomeHeader />
        <HomeKPIs metrics={metrics} setCurrentView={setCurrentView} />
      </div>

      {/* Main Grid: Full Width */}
      <div className="flex flex-col gap-8 w-full">
        {/* Calendar and Operational Tasks */}
        <HomeWorkspace projects={projects} tasks={tasks} agendaEvents={agendaEvents} setCurrentView={setCurrentView} />

        {/* Business analytics */}
        <HomeAnalytics financeEntries={finance} />
      </div>
    </div>
  );
}
