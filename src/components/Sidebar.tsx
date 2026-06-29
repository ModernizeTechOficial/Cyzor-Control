import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { useAuth } from '../context/AuthContext.tsx';
import { useBranding } from '../hooks/useBranding.ts';
import { LayoutDashboard, Building2, Users, Package, GitBranch, Lightbulb, FileText, DollarSign, BotMessageSquare, Settings, Calendar, ShieldCheck, StickyNote, Workflow } from 'lucide-react';
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
  const { activeWorkspace } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('Pro');
  const { iconUrl, iconSize, appName } = useBranding();

  useEffect(() => {
    const handlePlanUpdate = () => {
      setCurrentPlan(localStorage.getItem('saas_current_plan') || 'Pro');
    };
    handlePlanUpdate();
    window.addEventListener('workspaceChanged', handlePlanUpdate);

    return () => {
      window.removeEventListener('workspaceChanged', handlePlanUpdate);
    };
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-[#111111]/20 backdrop-blur-sm z-30 lg:hidden transition-all animate-in fade-in duration-200" 
          onClick={toggleSidebar}
        />
      )}

      <nav className={`fixed left-0 top-0 h-screen flex flex-col py-6 lg:py-8 border-r border-[#0F172A0F] bg-[#FFFFFF] lg:rounded-r-[30px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[88px] px-3' : 'translate-x-0 w-[280px] px-6'}`}>

      <div className={`flex items-center mb-10 px-2 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          {iconUrl ? (
            <img src={iconUrl} alt="Logo" width={iconSize} height={iconSize} />
          ) : (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#111111] leading-tight tracking-wide whitespace-nowrap">{appName}</span>
              <span className="bg-[#111111] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{currentPlan}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider truncate max-w-[150px]" title={activeWorkspace?.name}>
                {activeWorkspace?.name}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1 w-full flex-1 overflow-y-auto overflow-x-hidden mt-2 px-1.5 custom-scrollbar">
        <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} isCollapsed={isCollapsed} />
        <NavItem icon={Building2} label="Empresas" active={currentView === 'empresas'} onClick={() => setCurrentView('empresas')} isCollapsed={isCollapsed} />
        <NavItem icon={Users} label="Clientes" active={currentView === 'clientes'} onClick={() => setCurrentView('clientes')} isCollapsed={isCollapsed} />
        <NavItem icon={Package} label="Produtos" active={currentView === 'produtos'} onClick={() => setCurrentView('produtos')} isCollapsed={isCollapsed} />
        <NavItem icon={GitBranch} label="Projetos" active={currentView === 'projetos'} onClick={() => setCurrentView('projetos')} isCollapsed={isCollapsed} badge="3" />
        <NavItem icon={Lightbulb} label="Ideias" active={currentView === 'ideias'} onClick={() => setCurrentView('ideias')} isCollapsed={isCollapsed} />
        <NavItem icon={FileText} label="Documentação" active={currentView === 'documentacao'} onClick={() => setCurrentView('documentacao')} isCollapsed={isCollapsed} />
        <NavItem icon={DollarSign} label="Financeiro" active={currentView === 'financeiro'} onClick={() => setCurrentView('financeiro')} isCollapsed={isCollapsed} badge="2" />
        <NavItem icon={Calendar} label="Agenda" active={currentView === 'agenda'} onClick={() => setCurrentView('agenda')} isCollapsed={isCollapsed} />
        <NavItem icon={StickyNote} label="Google Keep" active={currentView === 'keep'} onClick={() => setCurrentView('keep')} isCollapsed={isCollapsed} />
        <NavItem icon={Workflow} label="Flow Builder" active={currentView === 'flow-builder'} onClick={() => setCurrentView('flow-builder')} isCollapsed={isCollapsed} />
        <NavItem icon={BotMessageSquare} label="IA Intelligence" active={currentView === 'ia'} onClick={() => setCurrentView('ia')} isCollapsed={isCollapsed} badge="5" />
        
        <div className="mt-auto pt-6 border-t border-[#0F172A05]">
            <NavItem icon={Settings} label="Configurações" active={currentView === 'configuracoes'} onClick={() => setCurrentView('configuracoes')} isCollapsed={isCollapsed} />
        </div>
      </div>
      
      <div className={`mt-6 pt-6 border-t border-[#0F172A08] w-full flex items-center cursor-pointer hover:bg-[#F8FAFC] rounded-3xl transition-all duration-300 group ${isCollapsed ? 'justify-center p-2' : 'gap-4 px-4 p-3'}`}>
        <div className="relative">
          <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0" 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-bold text-[#111111] truncate group-hover:text-blue-600 transition-colors tracking-tight">Admin User</span>
            <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.1em] opacity-60">Enterprise Tier</span>
          </div>
        )}
      </div>
    </nav>
  </>
);
}

function NavItem({ icon: Icon, label, active, isCollapsed, className = "", onClick, badge }: { icon: any, label: string, active?: boolean, isCollapsed?: boolean, className?: string, onClick?: () => void, badge?: string }) {
  return (
    <button onClick={onClick} className={`relative w-full flex items-center rounded-2xl transition-all duration-300 group/item ${isCollapsed ? 'justify-center p-3.5' : 'gap-3.5 px-4 py-3'} ${className} ${active ? 'bg-[#111111] text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] z-10' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111111]'}`}>
      <Icon size={18} className={`flex-shrink-0 ${active ? "text-white" : "text-[#64748B] group-hover/item:text-[#111111] transition-colors"}`} strokeWidth={active ? 2.5 : 2} />
      {!isCollapsed && (
        <div className="flex items-center justify-between flex-1">
          <span className="font-bold text-[14px] whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">{label}</span>
          {badge && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] flex items-center justify-center border transition-all ${active ? 'bg-white/10 text-white border-white/10' : 'bg-white text-[#111111] border-[#0F172A08] shadow-sm'}`}>
              {badge}
            </span>
          )}
        </div>
      )}
      
      {isCollapsed && badge && !active && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
      )}
      
      {active && (
        <motion.div 
          layoutId="sidebar-active-indicator"
          className={`absolute left-0 w-1 bg-white rounded-full ${isCollapsed ? 'h-4' : 'h-5'}`}
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}
