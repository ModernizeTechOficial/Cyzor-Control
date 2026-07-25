import { useState, useEffect } from 'react';
import CompanyModal from './CompanyModal';
import { useAuth } from '../context/AuthContext.tsx';
import { useCompanies, useProjects } from '../hooks/useCyzorQueries';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import StandardHeader from './layout/StandardHeader';
import { Plus, ChevronLeft } from 'lucide-react';
import CompanyStats from './empresas/CompanyStats';
import CompanyFilters from './empresas/CompanyFilters';
import CompanyTable from './empresas/CompanyTable';
import CompanyActivity from './empresas/CompanyActivity';
import UpcomingEvents from './empresas/UpcomingEvents';
import FinancialSummary from './empresas/FinancialSummary';
import Charts from './empresas/Charts';
import CompanyActionBar from './empresas/CompanyActionBar';

import { useNavigation } from "../context/NavigationContext";
import { Vision360 } from "./common/Vision360";
import { EntityHero } from "./common/EntityHero";

export default function EmpresasView() {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  // Data
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();
  const { data: projectsData } = useProjects();

  const [companies, setCompanies] = useState<any[]>([]);
  useEffect(() => { 
    if (companiesData && projectsData) {
      const companiesWithProjects = companiesData.map((c: any) => ({
        ...c,
        projects: projectsData.filter((p: any) => p.companyId === c.id).length
      }));
      setCompanies(companiesWithProjects);
    } else if (companiesData) {
      setCompanies(companiesData);
    }
  }, [companiesData, projectsData]);
  const [clients, setClients] = useState<any[]>([]);
  const [finance, setFinance] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { fetchWithAuth, activeWorkspace } = useAuth();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table'|'grid'>('table');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  const fetchCompanies = async () => {
    if (!activeWorkspace) return;
    try {
      const [compRes, finRes, cliRes, projRes] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/clients'),
        fetchWithAuth('/api/projects')
      ]);
      
      let projectsData = [];
      if (projRes.ok) {
        projectsData = await projRes.json();
      }

      if (compRes.ok) {
        const data = await compRes.json();
        const companiesWithProjects = data.map((c: any) => ({
          ...c,
          projects: projectsData.filter((p: any) => p.companyId === c.id).length
        }));
        setCompanies(companiesWithProjects);
      }
      if (finRes.ok) {
        const finData = await finRes.json();
        setFinance(finData);
        const revenue = finData
          .filter((f: any) => f.type === 'RECEITA')
          .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
        setTotalRevenue(revenue);
      }
      if (cliRes.ok) {
        const cliData = await cliRes.json();
        setClients(cliData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [activeWorkspace]);

  // If there's exactly one company in this workspace and no company filter active,
  // auto-select it so the user lands on the company 360 instead of an empty list page.
  useEffect(() => {
    if (!globalFilters.companyId && companies.length === 1) {
      const only = companies[0];
      if (only && only.id) {
        setGlobalFilters({ companyId: only.id });
      }
    }
  }, [companies, globalFilters.companyId, setGlobalFilters]);

  // Derived state
  const activeCompaniesCount = companies.filter(c => c.status === 'Ativo' || c.status === 'ACTIVE' || !c.status).length;
  const totalProjectsCount = companies.reduce((acc, c) => acc + Number(c.projects || 0), 0);

  // Filter logic
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      const s = c.status?.toUpperCase() || 'ACTIVE';
      if (statusFilter === 'ACTIVE' && s !== 'ACTIVE' && s !== 'ATIVO') matchesStatus = false;
      if (statusFilter === 'AT_RISK' && s !== 'AT_RISK' && s !== 'EM RISCO') matchesStatus = false;
      if (statusFilter === 'INACTIVE' && s !== 'INACTIVE' && s !== 'INATIVO') matchesStatus = false;
    }

    let matchesSegment = true;
    if (segmentFilter !== 'ALL') {
      const seg = c.industry?.toUpperCase() || '';
      matchesSegment = seg.includes(segmentFilter.toUpperCase());
    }

    return matchesSearch && matchesStatus && matchesSegment;
  });

  const handleEditClick = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setGlobalFilters({ companyId: company.id });
    window.history.pushState({}, '', `/companies/${company.id}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleRowClick = (company: any) => {
    setGlobalFilters({ companyId: company.id });
    window.history.pushState({}, '', `/companies/${company.id}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompanyIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedCompanyIds([]);
  };

  if (isCompaniesLoading) {
    return <SkeletonDashboard />;
  }

  if (globalFilters.companyId) {
    const activeCompany = companies.find(c => c.id.toString() === globalFilters.companyId?.toString());
    if (activeCompany) {
      return (
        <div className="w-full mx-auto pb-12 flex flex-col animate-in fade-in duration-500 relative bg-[#FAFAFA]/30">
          <div className="flex flex-col">
            <EntityHero
              entityType="company"
              name={activeCompany.name}
              description={activeCompany.industry ? `Empresa atuante no segmento de ${activeCompany.industry}.` : 'Parceiro comercial registrado no ecossistema Cyzor Control.'}
              logoUrl={activeCompany.logoUrl}
              coverUrl={activeCompany.coverUrl}
              breadcrumbs={['Perspectiva Corporativa', '360°', activeCompany.name]}
              badges={[
                { label: activeCompany.status || 'Ativo', variant: 'secondary' },
                { label: activeCompany.industry || 'Sem Setor', variant: 'neutral' },
                { label: activeCompany.cnpj || 'Sem CNPJ', variant: 'neutral' }
              ]}
              actions={
                <button 
                  onClick={() => setGlobalFilters({})} 
                  className="px-4 py-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-bold text-xs"
                >
                  <ChevronLeft size={16} />
                  <span>Voltar para Lista</span>
                </button>
              }
            />
          </div>
          
          <div className="px-4 sm:px-6 lg:px-10 mt-6">
            <Vision360
              entityType="company"
              entityId={activeCompany.id}
              entityName={activeCompany.name}
              entityData={activeCompany}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      
      <StandardHeader 
        title="Empresas"
        subtitle="Gerencie todas as empresas, projetos, clientes e indicadores em um único lugar."
        actions={[
          {
            label: 'Nova Empresa',
            icon: Plus,
            onClick: () => { setEditingCompany(null); setIsModalOpen(true); },
            variant: 'primary'
          }
        ]}
      />

      <CompanyStats 
        totalCompanies={companies.length}
        activeCompanies={activeCompaniesCount}
        totalRevenue={totalRevenue}
        totalProjects={totalProjectsCount}
        totalClients={clients.length}
      />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <CompanyFilters 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            segmentFilter={segmentFilter} setSegmentFilter={setSegmentFilter}
            viewMode={viewMode} setViewMode={setViewMode}
          />
          <CompanyTable 
            companies={filteredCompanies}
            finance={finance}
            onSelect={handleRowClick}
            onEdit={handleEditClick}
            selectedCompanyIds={selectedCompanyIds}
            toggleSelection={toggleSelection}
            viewMode={viewMode}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <Charts finance={finance} companies={companies} />
          </div>
          <div className="lg:col-span-3">
            <CompanyActivity />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UpcomingEvents />
          <FinancialSummary />
        </div>
      </div>

      <CompanyActionBar 
        selectedCount={selectedCompanyIds.length} 
        onClear={clearSelection} 
      />

      <CompanyModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCompany(null); }} 
        onSuccess={fetchCompanies} 
        company={editingCompany}
      />
    </div>
  );
}
