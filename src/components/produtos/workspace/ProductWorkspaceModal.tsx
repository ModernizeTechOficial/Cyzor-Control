import { 
  X, Package, LayoutGrid, DollarSign, FileText, LineChart, Target, Settings, Building2, Calendar, GitBranch, ArrowUpRight, Copy, CheckCircle2, AlertTriangle, Users, Save, Edit3, Trash2, Plus, Clock, Rocket,
  CloudLightning, HardDrive, Cpu, Fingerprint, History, CreditCard, ChevronRight, Activity
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import WorkspaceHeader from './WorkspaceHeader';
import WorkspaceKPIs from './WorkspaceKPIs';
import WorkspaceSidebar from './WorkspaceSidebar';
import VisaoGeralTab from './tabs/VisaoGeralTab';
import ProjetosTab from './tabs/ProjetosTab';
import DeploysTab from './tabs/DeploysTab';
import FinanceiroTab from './tabs/FinanceiroTab';
import RoadmapTab from './tabs/RoadmapTab';
import AnalyticsTab from './tabs/AnalyticsTab';
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
          <WorkspaceHeader product={product} companies={companies} />

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

import { useState } from 'react';

function WorkspaceTabsContainer({ product, onSave, onDelete, companies }: any) {
  const [activeTab, setActiveTab] = useState('visao_geral');

  const tabs = [
    { id: 'visao_geral', label: 'Visão Geral' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'deploys', label: 'Deploys' },
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
        {activeTab === 'visao_geral' && <VisaoGeralTab product={product} onSave={onSave} companies={companies} />}
        {activeTab === 'projetos' && <ProjetosTab product={product} onSave={onSave} />}
        {activeTab === 'deploys' && <DeploysTab product={product} />}
        {activeTab === 'financeiro' && <FinanceiroTab product={product} />}
        {activeTab === 'roadmap' && <RoadmapTab product={product} onSave={onSave} />}
        {activeTab === 'analytics' && <AnalyticsTab product={product} />}
        {['clientes', 'licencas', 'documentacao', 'equipe', 'logs', 'configuracoes'].includes(activeTab) && (
          <OutrasTabs activeTab={activeTab} product={product} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}
