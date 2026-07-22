import { 
  X, Package, LayoutGrid, DollarSign, FileText, LineChart, Target, Settings, Building2, Calendar, GitBranch, ArrowUpRight, Copy, CheckCircle2, AlertTriangle, Users, Save, Edit3, Trash2, Plus, Clock, Rocket,
  CloudLightning, HardDrive, Cpu, Fingerprint, History, CreditCard, ChevronRight, Activity, Github, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useWorkspacePermissions } from '../../../hooks/useWorkspacePermissions';
import { EntityHero } from '../../common/EntityHero';
import WorkspaceKPIs from './WorkspaceKPIs';
import WorkspaceSidebar from './WorkspaceSidebar';
import VisaoGeralTab from './tabs/VisaoGeralTab';
import ProjetosTab from './tabs/ProjetosTab';
import FinanceiroTab from './tabs/FinanceiroTab';
import RoadmapTab from './tabs/RoadmapTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import LicencasTab from './tabs/LicencasTab';
import ClientesTab from './tabs/ClientesTab';
import EquipeTab from './tabs/EquipeTab';
import OutrasTabs from './tabs/OutrasTabs';

interface ProductWorkspaceModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (p: any) => void;
  onDelete?: (id: any) => void;
  companies?: any[];
}

export default function ProductWorkspaceModal({ product, isOpen, onClose, onSave, onDelete, companies }: ProductWorkspaceModalProps) {
  if (!isOpen || !product) return null;

  const companyName = companies?.find((c: any) => c.id === product.companyId)?.name || 'Empresa Interna';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#FFFFFF] w-full h-full sm:h-[98vh] sm:w-[98vw] max-w-[1600px] sm:rounded-[32px] border border-[#0F172A0F] shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-[0.98] duration-300 relative">
        
        {/* Actions Absolute Position */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-[#0F172A0F] flex items-center justify-center text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all shadow-sm">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative bg-[#FAFAFA]/30">
          
          {/* Header */}
          <EntityHero
            entityType="product"
            name={product.name}
            description={product.description || 'Sem descrição cadastrada para este produto.'}
            logoUrl={product.logoUrl}
            coverUrl={product.coverUrl}
            breadcrumbs={['Perspectiva de Engenharia & Negócios', '360°', product.name]}
            badges={[
              { label: companyName, variant: 'neutral' },
              { label: product.status || 'Em Desenvolvimento', variant: product.status === 'Produção' ? 'secondary' : 'accent' },
              { label: product.version || 'v1.0.0', variant: 'neutral' }
            ]}
            actions={
              <div className="flex items-center gap-2 mr-12 md:mr-0">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 transition-all cursor-pointer">
                  <Github size={14} />
                  <span className="hidden sm:inline">Repositório</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 transition-all cursor-pointer">
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Visualizar</span>
                </button>
              </div>
            }
          />

          {/* KPIs */}
          <div className="px-8 -mt-6 mb-8 relative z-10">
             <WorkspaceKPIs product={product} />
          </div>

          <div className="flex flex-1 gap-8 px-8 pb-12 items-start relative max-w-[1600px] mx-auto w-full">
             
             {/* Left Content Area (Tabs + Content) */}
             <div className="flex-1 flex flex-col min-w-0 bg-white border border-[#0F172A0F] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <WorkspaceTabsContainer product={product} onSave={onSave} onDelete={onDelete} companies={companies} />
             </div>

             {/* Right Fixed Sidebar */}
             <div className="hidden xl:flex w-[340px] shrink-0 sticky top-0">
                <WorkspaceSidebar product={product} />
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Vision360 } from '../../common/Vision360';
import { VisualIdentityTab } from '../../common/VisualIdentityTab';

function WorkspaceTabsContainer({ product, onSave, onDelete, companies }: any) {
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [localProduct, setLocalProduct] = useState(product);
  const { canViewFinance } = useWorkspacePermissions();

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  useEffect(() => {
    if (!canViewFinance && activeTab === 'financeiro') {
      setActiveTab('visao_geral');
    }
  }, [canViewFinance, activeTab]);

  const allTabs = [
    { id: 'visao_geral', label: 'Visão Geral' },
    { id: 'visao_360', label: 'Visão 360°' },
    { id: 'identidade_visual', label: 'Identidade Visual' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'licencas', label: 'Licenças' },
    { id: 'documentacao', label: 'Documentação' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'equipe', label: 'Equipe' },
    { id: 'logs', label: 'Logs' },
    { id: 'configuracoes', label: 'Configurações' },
  ];
  const tabs = canViewFinance ? allTabs : allTabs.filter((tab) => tab.id !== 'financeiro');

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Tabs */}
      <div className="flex px-6 gap-6 overflow-x-auto custom-scrollbar border-b border-[#0F172A05] bg-[#FAFAFA]/50 sticky top-0 z-20 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-5 px-1 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${
                isActive 
                  ? 'border-[#111111] text-[#111111]' 
                  : 'border-transparent text-[#64748B] hover:text-[#111111] hover:border-[#111111]/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-8">
        {activeTab === 'visao_geral' && <VisaoGeralTab product={localProduct} onSave={onSave} companies={companies} />}
        {activeTab === 'visao_360' && <Vision360 entityType="product" entityId={localProduct.id} entityName={localProduct.name} entityData={localProduct} />}
        {activeTab === 'identidade_visual' && (
          <VisualIdentityTab 
            entityName={localProduct.name}
            logoUrl={localProduct.logoUrl || ''}
            coverUrl={localProduct.coverUrl || ''}
            onChangeLogo={(url) => {
              const updated = { ...localProduct, logoUrl: url };
              setLocalProduct(updated);
              onSave?.(updated);
            }}
            onChangeCover={(url) => {
              const updated = { ...localProduct, coverUrl: url };
              setLocalProduct(updated);
              onSave?.(updated);
            }}
          />
        )}
        {activeTab === 'projetos' && <ProjetosTab product={localProduct} onSave={onSave} />}
        {activeTab === 'clientes' && <ClientesTab product={localProduct} />}
        {activeTab === 'financeiro' && canViewFinance && <FinanceiroTab product={localProduct} />}
        {activeTab === 'licencas' && <LicencasTab product={localProduct} />}
        {activeTab === 'roadmap' && <RoadmapTab product={localProduct} onSave={onSave} />}
        {activeTab === 'analytics' && <AnalyticsTab product={localProduct} />}
        {activeTab === 'equipe' && <EquipeTab product={localProduct} />}
        {['documentacao', 'logs', 'configuracoes'].includes(activeTab) && (
          <OutrasTabs activeTab={activeTab} product={localProduct} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}
