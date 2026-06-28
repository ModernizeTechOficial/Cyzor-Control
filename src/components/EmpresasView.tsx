import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import CompanyModal from './CompanyModal';
import CompanyModuleModal from './CompanyModuleModal';
import { Building2, Activity, DollarSign, FolderGit2, Plus, MoreHorizontal, X, ArrowRight, Package, FileText, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export default function EmpresasView() {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Informações Gerais');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [companies, setCompanies] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [finance, setFinance] = useState<any[]>([]);
  const { fetchWithAuth, activeWorkspace } = useAuth();

  const fetchCompanies = async () => {
    if (!activeWorkspace) return;
    try {
      const [compRes, finRes] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/finance'),
      ]);
      
      if (compRes.ok) {
        const data = await compRes.json();
        setCompanies(data);
        if (selectedCompany) {
          const updated = data.find((c: any) => c.id === selectedCompany.id);
          if (updated) setSelectedCompany(updated);
          else setSelectedCompany(null);
        }
      }
      if (finRes.ok) {
        const finData = await finRes.json();
        setFinance(finData);
        const revenue = finData
          .filter((f: any) => f.type === 'RECEITA')
          .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
        setTotalRevenue(revenue);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [activeWorkspace]);

  const tabs = [
    { label: 'Informações Gerais', icon: Activity },
    { label: 'Produtos', icon: Package, count: selectedCompany?.products },
    { label: 'Projetos', icon: FolderGit2, count: selectedCompany?.projects },
    { label: 'Financeiro', icon: DollarSign },
    { label: 'Documentação', icon: FileText },
    { label: 'Equipe', icon: Building2 },
  ];

  const handleEditClick = (e: React.MouseEvent, company: any) => {
    e.stopPropagation();
    setEditingCompany(company);
    setIsModalOpen(true);
  };

    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 text-left">
        {/* Main Content Area */}
        <div className={`flex flex-col gap-6 lg:gap-10 transition-all duration-300 ${selectedCompany ? 'w-full lg:w-2/3' : 'w-full'}`}>
          <section className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">Empresas</h1>
              <p className="text-[#64748B] text-base sm:text-lg font-medium tracking-wide">Gestão centralizada do portfólio de empresas.</p>
            </div>
            <button 
              onClick={() => { setEditingCompany(null); setIsModalOpen(true); }}
              className="w-full sm:w-auto bg-[#111111] text-white px-6 py-3.5 rounded-[16px] font-bold text-sm tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
            >
              <Plus size={18} />
              Nova Empresa
            </button>
          </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard title="Total de Empresas" value={companies.length.toString()} icon={Building2} />
          <MetricCard title="Empresas Ativas" value={companies.filter(c => c.status === 'Ativo' || c.status === 'ACTIVE' || !c.status).length.toString()} sub="" icon={Activity} />
          <MetricCard title="Receita Consolidada" value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="" icon={DollarSign} />
          <MetricCard title="Projetos Vinculados" value={companies.reduce((acc, c) => acc + Number(c.projects || 0), 0).toString()} icon={FolderGit2} />
        </section>

        <section className="flex gap-10">
          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] sm:rounded-[30px] p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-display font-bold text-[#111111] tracking-tight">Portfólio</h3>
              <button className="w-8 h-8 rounded-[12px] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#0F172A0F] text-[#64748B]">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-[10px] sm:text-[11px] font-bold uppercase text-[#64748B] border-b border-[#0F172A0F] tracking-widest whitespace-nowrap">
                    <th className="pb-4 font-bold px-5 sm:px-0">Nome</th>
                    <th className="pb-4 font-bold">Segmento</th>
                    <th className="pb-4 font-bold">Produtos</th>
                    <th className="pb-4 font-bold">Projetos</th>
                    <th className="pb-4 font-bold">Receita</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold px-5 sm:px-0"></th>
                  </tr>
                </thead>
                <tbody className="text-[13px] sm:text-sm">
                  {companies.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => { setSelectedCompany(c); setActiveTab('Informações Gerais'); }}
                      className={`border-b border-[#0F172A0F]/50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors cursor-pointer group ${selectedCompany?.id === c.id ? 'bg-[#FAFAFA]' : ''}`}
                    >
                      <td className="py-4 sm:py-5 font-semibold text-[#111111] whitespace-nowrap px-5 sm:px-0">{c.name}</td>
                      <td className="py-4 sm:py-5 text-[#64748B]">{c.industry || 'N/A'}</td>
                      <td className="py-4 sm:py-5 text-[#111111] font-medium">{c.products || 0}</td>
                      <td className="py-4 sm:py-5 text-[#111111] font-medium">{c.projects || 0}</td>
                      <td className="py-4 sm:py-5 font-semibold text-[#111111] whitespace-nowrap">
                        {`R$ ${finance
                            .filter(f => f.companyId === c.id && f.type === 'RECEITA')
                            .reduce((sum, f) => sum + Number(f.amount), 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                         }`}
                      </td>
                      <td className="py-4 sm:py-5">
                        <span className={`px-2.5 py-1.5 rounded-[10px] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                          (c.status === 'Ativo' || c.status === 'ACTIVE' || !c.status) ? 'bg-green-50 text-green-700 border border-green-100' : 
                          c.status === 'Em Risco' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}>
                          {c.status || 'Ativo'}
                        </span>
                      </td>
                      <td className="py-4 sm:py-5 text-right px-5 sm:px-0">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={(e) => handleEditClick(e, c)}
                             className="p-2 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#111111] transition-all"
                           >
                             <Edit3 size={16} />
                           </button>
                           <ArrowRight size={18} className="text-[#64748B] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Default Side Panel (Shown when no company is selected) */}
          {!selectedCompany && (
            <div className="w-[340px] shrink-0 flex flex-col gap-6 hidden xl:flex">
              <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest mb-6 border-b border-[#0F172A0F] pb-4">Últimas Atualizações</h3>
                <div className="flex flex-col gap-5 text-sm text-[#64748B] text-center py-4">
                  Nenhuma atualização recente encontrada.
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest mb-6 border-b border-[#0F172A0F] pb-4">Próximos Eventos</h3>
                <div className="flex flex-col gap-4 text-sm text-[#64748B] text-center py-4">
                  Agendas limpas para os próximos dias.
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Selected Company Panel (Slide over) */}
      {selectedCompany && (
        <div className="w-full lg:w-1/3 shrink-0 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-auto lg:h-[calc(100vh-200px)] lg:sticky top-28">
          <div className="p-8 border-b border-[#0F172A0F] flex justify-between items-start bg-[#FAFAFA]">
            <div>
              <div className="w-16 h-16 rounded-[20px] bg-[#FFFFFF] border border-[#0F172A0F] flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                 <Building2 size={24} className="text-[#111111]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-[#111111] tracking-tight">{selectedCompany.name}</h2>
              <p className="text-sm font-medium text-[#64748B] mt-1">{selectedCompany.segment}</p>
            </div>
            <button 
              onClick={() => setSelectedCompany(null)}
              className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FFFFFF] border border-transparent hover:border-[#0F172A0F] text-[#64748B] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <CompanyTab 
                  key={tab.label}
                  icon={tab.icon}
                  label={tab.label}
                  count={tab.count}
                  active={activeTab === tab.label}
                  onClick={() => {
                    setActiveTab(tab.label);
                    if (tab.label !== 'Informações Gerais') {
                      setActiveModal(tab.label);
                    }
                  }}
                />
              ))}
            </div>
            
            {/* Dynamic Content */}
            <div className="mt-8 px-4">
              <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest mb-4">{activeTab}</h4>
              <div className="text-sm text-[#111111]">
                {activeTab === 'Informações Gerais' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] p-4 text-center">
                       <div className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Receita MRR</div>
                       <div className="text-lg font-bold text-[#111111]">
                         {`R$ ${finance
                            .filter(f => f.companyId === selectedCompany.id && f.type === 'RECEITA')
                            .reduce((sum, f) => sum + Number(f.amount), 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                         }`}
                       </div>
                    </div>
                    <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] p-4 text-center">
                       <div className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Crescimento</div>
                       <div className="text-lg font-bold text-[#111111]">0%</div>
                    </div>
                  </div>
                )}
                {activeTab !== 'Informações Gerais' && <p>Conteúdo de {activeTab} para {selectedCompany.name} em breve.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCompany && (
        <CompanyModuleModal 
          isOpen={!!activeModal} 
          onClose={() => setActiveModal(null)} 
          company={selectedCompany} 
          moduleType={activeModal || ''} 
        />
      )}

      <CompanyModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCompany(null); }} 
        onSuccess={fetchCompanies} 
        company={editingCompany}
      />
    </div>
  );
}

function CompanyTab({ icon: Icon, label, count, active, onClick }: { icon: any, label: string, count?: number, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all hover:bg-[#FAFAFA] border border-transparent ${active ? 'bg-[#FAFAFA] border-[#0F172A0F]' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-[#111111]' : 'text-[#64748B]'} />
        <span className={`text-sm font-semibold ${active ? 'text-[#111111]' : 'text-[#64748B]'}`}>{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-bold bg-[#FFFFFF] border border-[#0F172A0F] text-[#111111] px-2.5 py-1 rounded-lg shadow-sm">
          {count}
        </span>
      )}
    </button>
  );
}
