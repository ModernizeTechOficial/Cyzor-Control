import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Settings, Layout, User, Building2, Users, Shield, BotMessageSquare, 
  Link as LinkIcon, DollarSign, Bell, Paintbrush, Lock, Database, Server,
  CreditCard
} from 'lucide-react';

// Live interactive settings submodules
import SecWorkspace from './settings/SecWorkspace';
import SecAssinatura from './settings/SecAssinatura';
import SecPerfilGeral from './settings/SecPerfilGeral';
import SecAdminModulos from './settings/SecAdminModulos';

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
  { id: 'aparencia', label: 'Aparência', icon: Paintbrush },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'sistema', label: 'Sistema', icon: Server },
];

export default function ConfiguracoesView() {
  const { updateSaaSBackend } = useAuth();
  
  const [activeSection, setActiveSection] = useState('workspace');
  const [activeWorkspace, setActiveWorkspace] = useState('Global Hub');
  const [currentPlan, setCurrentPlan] = useState('Pro');

  useEffect(() => {
    const loadSaaSStates = () => {
      setActiveWorkspace(localStorage.getItem('active_workspace') || 'Global Hub');
      setCurrentPlan(localStorage.getItem('saas_current_plan') || 'Pro');
    };
    loadSaaSStates();
    window.addEventListener('workspaceChanged', loadSaaSStates);
    return () => window.removeEventListener('workspaceChanged', loadSaaSStates);
  }, []);

  const handleSelectWorkspace = (name: string, id: number) => {
    localStorage.setItem('active_workspace', name);
    setActiveWorkspace(name);
    window.dispatchEvent(new Event('workspaceChanged'));
    updateSaaSBackend(undefined, id).catch(console.error); // full live workspace update in sqlite backend
  };

  const handleUpgradePlan = (plan: string) => {
    localStorage.setItem('saas_current_plan', plan);
    setCurrentPlan(plan);
    window.dispatchEvent(new Event('workspaceChanged'));
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
    
    // Admin list components
    if (['empresas', 'usuarios', 'permissoes', 'ia', 'integracoes', 'financeiro'].includes(activeSection)) {
      return <SecAdminModulos section={activeSection} />;
    }

    // Profiles and global general preferences
    return <SecPerfilGeral section={activeSection} />;
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      {/* Header */}
      <section className="flex-shrink-0">
        <h1 className="text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">Configurações</h1>
        <p className="text-[#64748B] text-lg font-medium tracking-wide">Gerencie todo o comportamento, operação e personalização da plataforma.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1 min-h-0">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[260px] flex-shrink-0 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar shadow-sm">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all text-sm font-bold cursor-pointer ${
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
        <div className="flex-1 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-8 overflow-y-auto custom-scrollbar shadow-sm text-left">
          <div className="max-w-4xl">
            {renderSettingsSection()}
          </div>
        </div>

      </div>
    </div>
  );
}
