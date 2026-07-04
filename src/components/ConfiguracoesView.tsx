import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Settings, Layout, User, Building2, Users, Shield, BotMessageSquare, 
  Link as LinkIcon, DollarSign, Bell, Paintbrush, Lock, Database, Server,
  CreditCard, Mail
} from 'lucide-react';
import StandardHeader from './layout/StandardHeader';

// Live interactive settings submodules
import SecWorkspace from './settings/SecWorkspace';
import SecAssinatura from './settings/SecAssinatura';
import SecPerfilGeral from './settings/SecPerfilGeral';
import SecAdminModulos from './settings/SecAdminModulos';
import SecEmails from './settings/SecEmails';

const SECTIONS = [
  { id: 'workspace', label: 'Workspace', icon: Layout },
  { id: 'assinatura', label: 'Assinatura & Planos', icon: CreditCard },
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresas', label: 'Empresas', icon: Building2 },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'permissoes', label: 'Permissões', icon: Shield },
  { id: 'ia', label: 'IA', icon: BotMessageSquare },
  { id: 'integracoes', label: 'Integrações', icon: LinkIcon },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'emails', label: 'E-mails', icon: Mail },
  { id: 'aparencia', label: 'Aparência', icon: Paintbrush },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'sistema', label: 'Sistema', icon: Server },
];

export default function ConfiguracoesView() {
  const { dbUser, activeWorkspace: authActiveWorkspace, updateSaaSBackend } = useAuth();
  
  const [activeSection, setActiveSection] = useState('workspace');
  const activeWorkspace = authActiveWorkspace?.name || 'Global Hub';
  const currentPlan = dbUser?.currentPlan || 'free';

  const handleSelectWorkspace = (name: string, id: number) => {
    updateSaaSBackend(undefined, id).catch(console.error); // full live workspace update in sqlite backend
  };

  const handleUpgradePlan = (plan: string) => {
    updateSaaSBackend(plan, undefined).catch(console.error); // fully persists plan change in sqlite backend
  };

  // Grouped routing layout for settings sections
  const renderSettingsSection = () => {
    if (activeSection === 'workspace') {
      return <SecWorkspace activeWorkspace={activeWorkspace} onSelect={handleSelectWorkspace} />;
    }
    if (activeSection === 'assinatura') {
      return <SecAssinatura currentPlan={currentPlan} onUpgrade={handleUpgradePlan} />;
    }
    if (activeSection === 'emails') {
      return <SecEmails />;
    }
    
    // Admin list components
    if (['empresas', 'usuarios', 'permissoes', 'ia', 'integracoes', 'financeiro'].includes(activeSection)) {
      return <SecAdminModulos section={activeSection} />;
    }

    // Profiles and global general preferences
    return <SecPerfilGeral section={activeSection} />;
  };

  return (
    <div className="flex flex-col gap-10 h-full px-4 sm:px-6 lg:px-10">
      {/* Header */}
      <StandardHeader 
        title="Configurações"
        subtitle="Gerencie todo o comportamento, operação e personalização da plataforma."
      />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1 min-h-0">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[260px] flex-shrink-0 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-2 md:p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar shadow-sm">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-[12px] md:rounded-[16px] transition-all text-[11px] md:text-sm font-bold cursor-pointer whitespace-nowrap ${
                 activeSection === sec.id 
                  ? 'bg-[#111111] text-white shadow-md' 
                  : 'text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#111111]'
              }`}
            >
              <sec.icon size={18} className={activeSection === sec.id ? 'text-white' : 'text-[#64748B]'} />
              {sec.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-5 md:p-8 overflow-y-auto custom-scrollbar shadow-sm text-left">
          <div className="w-full">
            {renderSettingsSection()}
          </div>
        </div>

      </div>
    </div>
  );
}
