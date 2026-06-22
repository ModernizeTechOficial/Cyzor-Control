import { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Package, GitBranch, Lightbulb, FileText, DollarSign, BotMessageSquare, Settings, Calendar, ShieldCheck, StickyNote } from 'lucide-react';
import { View } from '../types';

export default function Sidebar({ 
  isCollapsed, 
  toggleSidebar, 
  currentView, 
  setCurrentView 
}: { 
  isCollapsed: boolean, 
  toggleSidebar: () => void,
  currentView: View,
  setCurrentView: (view: View) => void
}) {
  const [activeWorkspace, setActiveWorkspace] = useState('Global Hub');
  const [currentPlan, setCurrentPlan] = useState('Pro');

  useEffect(() => {
    const handleWorkspaceUpdate = () => {
      const storedWorkspace = localStorage.getItem('active_workspace') || 'Global Hub';
      setActiveWorkspace(storedWorkspace);
      const storedPlan = localStorage.getItem('saas_current_plan') || 'Pro';
      setCurrentPlan(storedPlan);
    };

    handleWorkspaceUpdate(); // load initials
    window.addEventListener('workspaceChanged', handleWorkspaceUpdate);
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceUpdate);
    };
  }, []);

  return (
    <nav className={`fixed left-0 top-0 h-screen flex flex-col py-6 lg:py-8 border-r border-[#0F172A0F] bg-[#FFFFFF] lg:rounded-r-[30px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[88px] px-3' : 'translate-x-0 w-[280px] px-6'}`}>
      <div className={`flex items-center mb-10 px-2 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
        <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          {/* CYZOR Monogram */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#111111] leading-tight tracking-wide whitespace-nowrap">CYZOR</span>
              <span className="bg-[#111111] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{currentPlan}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider truncate max-w-[150px]" title={activeWorkspace}>
                {activeWorkspace}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2 w-full flex-1 overflow-y-auto overflow-x-hidden mt-2">
        <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} isCollapsed={isCollapsed} />
        <NavItem icon={Building2} label="Empresas" active={currentView === 'empresas'} onClick={() => setCurrentView('empresas')} isCollapsed={isCollapsed} />
        <NavItem icon={Package} label="Produtos" active={currentView === 'produtos'} onClick={() => setCurrentView('produtos')} isCollapsed={isCollapsed} />
        <NavItem icon={GitBranch} label="Projetos" active={currentView === 'projetos'} onClick={() => setCurrentView('projetos')} isCollapsed={isCollapsed} />
        <NavItem icon={Lightbulb} label="Ideias" active={currentView === 'ideias'} onClick={() => setCurrentView('ideias')} isCollapsed={isCollapsed} />
        <NavItem icon={FileText} label="Documentação" active={currentView === 'documentacao'} onClick={() => setCurrentView('documentacao')} isCollapsed={isCollapsed} />
        <NavItem icon={DollarSign} label="Financeiro" active={currentView === 'financeiro'} onClick={() => setCurrentView('financeiro')} isCollapsed={isCollapsed} />
        <NavItem icon={Calendar} label="Agenda" active={currentView === 'agenda'} onClick={() => setCurrentView('agenda')} isCollapsed={isCollapsed} />
        <NavItem icon={StickyNote} label="Google Keep" active={currentView === 'keep'} onClick={() => setCurrentView('keep')} isCollapsed={isCollapsed} />
        <NavItem icon={BotMessageSquare} label="IA" active={currentView === 'ia'} onClick={() => setCurrentView('ia')} isCollapsed={isCollapsed} />
        
        <div className="mt-auto">
            <NavItem icon={Settings} label="Configurações" active={currentView === 'configuracoes'} onClick={() => setCurrentView('configuracoes')} isCollapsed={isCollapsed} />
        </div>
      </div>
      
      <div className={`mt-6 pt-6 border-t border-[#0F172A0F] w-full flex items-center cursor-pointer hover:bg-[#FAFAFA] rounded-xl transition-colors ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-2 p-2'}`}>
        <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0" 
            alt="User" 
            className="w-10 h-10 rounded-full border border-[#0F172A0F] flex-shrink-0"
        />
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-[#111111] truncate">Admin User</span>
            <span className="text-xs text-[#64748B] truncate">admin@cyzor.com</span>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavItem({ icon: Icon, label, active, isCollapsed, className = "", onClick }: { icon: any, label: string, active?: boolean, isCollapsed?: boolean, className?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center rounded-[20px] transition-all duration-300 ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${className} ${active ? 'bg-[#111111] text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]' : 'text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#111111]'}`}>
      <Icon size={20} className={`flex-shrink-0 ${active ? "text-white" : "text-[#64748B] transition-colors"}`} />
      {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
    </button>
  );
}
