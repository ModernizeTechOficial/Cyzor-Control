import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  History, 
  Settings, 
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

import EquipeDashboard from './equipe/EquipeDashboard';
import MembrosTab from './equipe/MembrosTab';
import ConvitesTab from './equipe/ConvitesTab';
import FuncoesTab from './equipe/FuncoesTab';
import WorkspaceSettingsTab from './equipe/WorkspaceSettingsTab';
import AuditoriaTab from './equipe/AuditoriaTab';
import StandardHeader from './layout/StandardHeader';

type EquipeTab = 'dashboard' | 'membros' | 'convites' | 'funcoes' | 'configuracoes' | 'auditoria';

export default function EquipeView() {
  const [activeTab, setActiveTab] = useState<EquipeTab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'membros', label: 'Membros', icon: Users },
    { id: 'convites', label: 'Convites', icon: Mail },
    { id: 'funcoes', label: 'Funções & Permissões', icon: Shield },
    { id: 'auditoria', label: 'Auditoria', icon: History },
    { id: 'configuracoes', label: 'Workspace', icon: Settings },
  ];

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      {/* Header */}
      <StandardHeader 
        title="Time & Workspace"
        subtitle="Gerencie membros, convites, funções, permissões e auditoria do workspace em tempo real."
      />

      <div className="flex flex-col gap-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#0F172A0A] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EquipeTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-[#111111]' 
                  : 'text-[#64748B] hover:text-[#111111] hover:bg-[#F1F5F9]/50'
              }`}
            >
              <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeEquipeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111111]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <EquipeDashboard />}
              {activeTab === 'membros' && <MembrosTab />}
              {activeTab === 'convites' && <ConvitesTab />}
              {activeTab === 'funcoes' && <FuncoesTab />}
              {activeTab === 'auditoria' && <AuditoriaTab />}
              {activeTab === 'configuracoes' && <WorkspaceSettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
