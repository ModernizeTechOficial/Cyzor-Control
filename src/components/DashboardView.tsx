import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { View } from '../types';

import HomeHeader from './home/HomeHeader';
import HomeOverview from './home/HomeOverview';
import HomeWorkspace from './home/HomeWorkspace';
import HomeIntelligence from './home/HomeIntelligence';
import HomeAnalytics from './home/HomeAnalytics';
import HomeTimeline from './home/HomeTimeline';
import HomeWorkspaceStatus from './home/HomeWorkspaceStatus';
import QuickActions from './dashboard/QuickActions';

export default function DashboardView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth } = useAuth();
  
  const [metrics, setMetrics] = useState({ companies: 0, products: 0, projects: 0, clients: 0, revenue: 0, deploys: 0 });
  const [insights, setInsights] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeWorkspace) return;
      try {
        const [compRes, prodRes, projRes, finRes, insightRes, notifRes] = await Promise.all([
          fetchWithAuth('/api/companies'),
          fetchWithAuth('/api/products'),
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/finance'),
          fetchWithAuth('/api/ai/insights'),
          fetchWithAuth('/api/notifications')
        ]);
        const [companies, products, projectsData, finance, insightData, notifications] = await Promise.all([
          compRes.ok ? compRes.json() : [],
          prodRes.ok ? prodRes.json() : [],
          projRes.ok ? projRes.json() : [],
          finRes.ok ? finRes.json() : [],
          insightRes.ok ? insightRes.json() : { risk: '', opportunity: '', recommendation: '' },
          notifRes.ok ? notifRes.json() : []
        ]);
        setMetrics({
          companies: companies.length,
          products: products.length,
          projects: projectsData.length,
          clients: 0,
          revenue: finance.filter((f: any) => f.type === 'RECEITA').reduce((sum: number, entry: any) => sum + Number(entry.amount), 0),
          deploys: 0
        });
        setProjects(projectsData.slice(0, 5));
        setInsights([
            { id: '1', message: insightData.risk, type: 'high' },
            { id: '2', message: insightData.opportunity, type: 'medium' },
            { id: '3', message: insightData.recommendation, type: 'low' }
        ].filter(i => i.message));
        setActivities(notifications.slice(0, 6).map((n: any) => ({
            id: n.id.toString(),
            action: n.description,
            time: new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })));
      } catch (err) { console.error(err); }
    };
    fetchDashboardData();
  }, [activeWorkspace]);

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto w-full px-10 py-8">
      <HomeHeader />
      <HomeOverview metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8">
          <HomeWorkspace projects={projects} />
        </div>
        <div className="lg:col-span-4">
           <HomeIntelligence insights={insights} />
        </div>
      </div>

      <HomeAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8">
          <HomeTimeline activities={activities} />
        </div>
        <div className="lg:col-span-4">
          <HomeWorkspaceStatus />
        </div>
      </div>
    </div>
  );
}

