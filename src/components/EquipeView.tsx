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
  Building2,
  Briefcase,
  Layers3,
  Workflow,
  Activity,
  Sparkles
} from 'lucide-react';

import OverviewTab from './equipe/OverviewTab';
import MembrosTab from './equipe/MembrosTab';
import TeamsTab from './equipe/TeamsTab';
import DepartmentsTab from './equipe/DepartmentsTab';
import ConvitesTab from './equipe/ConvitesTab';
import FuncoesTab from './equipe/FuncoesTab';
import WorkspacesTab from './equipe/WorkspacesTab';
import OrganizationTab from './equipe/OrganizationTab';
import AuditoriaTab from './equipe/AuditoriaTab';
import WorkspaceSettingsTab from './equipe/WorkspaceSettingsTab';
import StandardHeader from './layout/StandardHeader';

type EquipeTab = 'overview' | 'membros' | 'teams' | 'departments' | 'convites' | 'funcoes' | 'workspaces' | 'organization' | 'auditoria' | 'configuracoes';

export default function EquipeView() {
  const [activeTab, setActiveTab] = useState<EquipeTab>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'membros', label: 'Members', icon: Users },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'convites', label: 'Invitations', icon: Mail },
    { id: 'funcoes', label: 'Roles & Permissions', icon: Shield },
    { id: 'workspaces', label: 'Workspaces', icon: Layers3 },
    { id: 'organization', label: 'Organization', icon: Workflow },
    { id: 'auditoria', label: 'Activity', icon: Activity },
    { id: 'configuracoes', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      {/* Header */}
      <StandardHeader 
        title="Teams & Workspaces"
        subtitle="Centro operacional de gestão organizacional, com overview executivo, membros, equipes, departamentos, convites, workspaces, permissões, organização e auditoria."
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
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'membros' && <MembrosTab />}
              {activeTab === 'teams' && <TeamsTab />}
              {activeTab === 'departments' && <DepartmentsTab />}
              {activeTab === 'convites' && <ConvitesTab />}
              {activeTab === 'funcoes' && <FuncoesTab />}
              {activeTab === 'workspaces' && <WorkspacesTab />}
              {activeTab === 'organization' && <OrganizationTab />}
              {activeTab === 'auditoria' && <AuditoriaTab />}
              {activeTab === 'configuracoes' && <WorkspaceSettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
