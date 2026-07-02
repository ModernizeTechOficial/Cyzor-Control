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
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <div className="p-8 pb-0">
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-bold uppercase tracking-widest mb-1">
            <Users size={12} />
            <span>Gestão de Equipe</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-[#111111] tracking-tight">Time & Workspace</h1>
        </div>

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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
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
  );
}
