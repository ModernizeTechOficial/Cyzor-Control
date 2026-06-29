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
    companies: 12,
    products: 45,
    projects: 128,
    clients: 842,
    revenue: 84.5,
    deploys: 24
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeWorkspace) return;
      try {
        const [compRes, prodRes, projRes, finRes, depRes] = await Promise.all([
          fetchWithAuth('/api/companies'),
          fetchWithAuth('/api/products'),
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/finance'),
          fetchWithAuth('/api/deploys')
        ]);

        const [companies, products, projectsData, finance, deploys] = await Promise.all([
          compRes.ok ? compRes.json() : [],
          prodRes.ok ? prodRes.json() : [],
          projRes.ok ? projRes.json() : [],
          finRes.ok ? finRes.json() : [],
          depRes.ok ? depRes.json() : []
        ]);

        const totalRevenue = finance
          .filter((f: any) => f.type === 'RECEITA')
          .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

        setMetrics({
          companies: companies.length || 12,
          products: products.length || 45,
          projects: projectsData.length || 128,
          clients: 842, // baseline
          revenue: totalRevenue ? Number((totalRevenue / 1000).toFixed(1)) : 84.5,
          deploys: deploys.length || 24
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
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto p-1.5">
      {/* Header, Visão Executiva do Ecossistema and Key Overview (Full Width) */}
      <div className="flex flex-col gap-8">
        <HomeHeader />
        <HomeKPIs metrics={metrics} />
        <HomeOverview metrics={metrics} />
      </div>

      {/* Main Grid: Left Workspace & Analytics vs Right Timeline & Redundancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* LEFT CONTAINER (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Calendar and Operational Tasks */}
          <HomeWorkspace projects={[]} />

          {/* Business analytics - now occupying full width of the left flow */}
          <HomeAnalytics />
        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Live Operational Log */}
          <HomeTimeline />

          {/* Infrastructure & Redundancy */}
          <HomeWorkspaceStatus />
        </div>
      </div>
    </div>
  );
}
