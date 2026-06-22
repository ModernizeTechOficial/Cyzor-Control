import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import ProjectTable from './ProjectTable';
import AIAssistant from './AIAssistant';
import CentralPrioridades from './CentralPrioridades';
import { Building2, Package, Lightbulb, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { View } from '../types';

export default function DashboardView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth, token } = useAuth();
  const [metrics, setMetrics] = useState({
    companies: 0,
    projects: 0,
    ideas: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!activeWorkspace) return;
      try {
        const [compRes, projRes, ideasRes, finRes] = await Promise.all([
          fetchWithAuth('/api/companies'),
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/ideas'),
          fetchWithAuth('/api/finance'),
        ]);

        const [companies, projects, ideas, finance] = await Promise.all([
          compRes.ok ? compRes.json() : [],
          projRes.ok ? projRes.json() : [],
          ideasRes.ok ? ideasRes.json() : [],
          finRes.ok ? finRes.json() : []
        ]);

        const totalRevenue = finance
          .filter((f: any) => f.type === 'RECEITA')
          .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);

        setMetrics({
          companies: companies.length,
          projects: projects.length,
          ideas: ideas.length,
          revenue: totalRevenue
        });

      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardMetrics();
  }, [token, activeWorkspace]);

  return (
    <>
      <section className="relative">
        <h1 className="text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">Central de Operações</h1>
        <p className="text-[#64748B] text-lg font-medium tracking-wide">Gerencie empresas, projetos e ideias em um único lugar.</p>
        <div className="absolute -right-4 top-0 opacity-10 select-none pointer-events-none hidden lg:block">
          <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30H40L50 10H80L90 50H120L130 30H200" stroke="#111111" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
            <circle cx="80" cy="10" r="3" fill="#111111"/>
            <circle cx="120" cy="50" r="3" fill="#111111"/>
          </svg>
        </div>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Empresas Ativas" value={metrics.companies.toString()} sub="" icon={Building2} />
        <MetricCard title="Projetos Ativos" value={metrics.projects.toString()} icon={Package} />
        <MetricCard title="Ideias em Validação" value={metrics.ideas.toString()} icon={Lightbulb} />
        <MetricCard title="Receita Mensal" value={`R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="" icon={CreditCard} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ProjectTable />
        <AIAssistant setCurrentView={setCurrentView} />
      </section>

      <section>
        <CentralPrioridades />
      </section>
    </>
  );
}
