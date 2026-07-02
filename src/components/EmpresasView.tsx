import { useState, useEffect } from 'react';
import CompanyModal from './CompanyModal';
import { useAuth } from '../context/AuthContext.tsx';
import StandardHeader from './layout/StandardHeader';
import { Plus } from 'lucide-react';
import CompanyStats from './empresas/CompanyStats';
import CompanyFilters from './empresas/CompanyFilters';
import CompanyTable from './empresas/CompanyTable';
import CompanyActivity from './empresas/CompanyActivity';
import UpcomingEvents from './empresas/UpcomingEvents';
import FinancialSummary from './empresas/FinancialSummary';
import Charts from './empresas/Charts';
import CompanyActionBar from './empresas/CompanyActionBar';

export default function EmpresasView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  // Data
  const [companies, setCompanies] = useState<any[]>([]);
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
      const [compRes, finRes, cliRes] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/clients'),
      ]);
      
      if (compRes.ok) {
        const data = await compRes.json();
        setCompanies(data);
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
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleRowClick = (company: any) => {
    setEditingCompany(company);
    setIsModalOpen(true);
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
