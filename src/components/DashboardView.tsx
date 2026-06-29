import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { View } from '../types';
import HomeHeader from './home/HomeHeader';
import HomeOverview from './home/HomeOverview';
import HomeKPIs from './home/HomeKPIs';
import HomeWorkspace from './home/HomeWorkspace';
import HomeAnalytics from './home/HomeAnalytics';
import HomeWorkspaceStatus from './home/HomeWorkspaceStatus';
import HomeTimeline from './home/HomeTimeline';

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
  
  const [projects, setProjects] = useState<any[]>([]);
  const [deploys, setDeploys] = useState<any[]>([]);
  const [finance, setFinance] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
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
  }, [activeWorkspace]);

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      {/* Header, Visão Executiva do Ecossistema and Key Overview (Full Width) */}
      <div className="flex flex-col gap-8">
        <HomeHeader />
        <HomeKPIs metrics={metrics} setCurrentView={setCurrentView} />
        <HomeOverview metrics={metrics} agendaEvents={agendaEvents} members={members} setCurrentView={setCurrentView} />
      </div>

      {/* Main Grid: Left Workspace & Analytics vs Right Timeline & Redundancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* LEFT CONTAINER (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Calendar and Operational Tasks */}
          <HomeWorkspace projects={projects} tasks={tasks} agendaEvents={agendaEvents} setCurrentView={setCurrentView} />

          {/* Business analytics - now occupying full width of the left flow */}
          <HomeAnalytics financeEntries={finance} />
        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Live Operational Log */}
          <HomeTimeline 
            deploys={deploys} 
            tasks={tasks}
            projects={projects}
            finance={finance}
            agendaEvents={agendaEvents}
          />

          {/* Infrastructure & Redundancy */}
          <HomeWorkspaceStatus 
            deploys={deploys}
            tasks={tasks}
            projects={projects}
            finance={finance}
            agendaEvents={agendaEvents}
            metrics={metrics}
            clients={clients}
          />
        </div>
      </div>
    </div>
  );
}
