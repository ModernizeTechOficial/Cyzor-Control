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
  const { activeWorkspace, dbUser } = useAuth();
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
        <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={Building2} label="Empresas" active={currentView === 'empresas'} onClick={() => setCurrentView('empresas')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={Users} label="Clientes" active={currentView === 'clientes'} onClick={() => setCurrentView('clientes')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={Package} label="Produtos" active={currentView === 'produtos'} onClick={() => setCurrentView('produtos')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={GitBranch} label="Projetos" active={currentView === 'projetos'} onClick={() => setCurrentView('projetos')} isCollapsed={isCollapsed} badge="3" toggleSidebar={toggleSidebar} />
        <NavItem icon={Lightbulb} label="Ideias" active={currentView === 'ideias'} onClick={() => setCurrentView('ideias')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={FileText} label="Documentação" active={currentView === 'documentacao'} onClick={() => setCurrentView('documentacao')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={DollarSign} label="Financeiro" active={currentView === 'financeiro'} onClick={() => setCurrentView('financeiro')} isCollapsed={isCollapsed} badge="2" toggleSidebar={toggleSidebar} />
        <NavItem icon={Calendar} label="Agenda" active={currentView === 'agenda'} onClick={() => setCurrentView('agenda')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={StickyNote} label="Google Keep" active={currentView === 'keep'} onClick={() => setCurrentView('keep')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={Workflow} label="Flow Builder" active={currentView === 'flow-builder'} onClick={() => setCurrentView('flow-builder')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <NavItem icon={BotMessageSquare} label="IA Intelligence" active={currentView === 'ia'} onClick={() => setCurrentView('ia')} isCollapsed={isCollapsed} badge="5" toggleSidebar={toggleSidebar} />
        
        {dbUser?.isPlatformAdmin && (
          <div className="mt-4 pt-4 border-t border-[#0F172A05]">
            <NavItem 
              icon={ShieldCheck} 
              label="Platform HQ" 
              active={false} 
              onClick={() => setCurrentView('admin')} 
              isCollapsed={isCollapsed} 
              toggleSidebar={toggleSidebar} 
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            />
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-[#0F172A05]">
            <NavItem icon={Settings} label="Configurações" active={currentView === 'configuracoes'} onClick={() => setCurrentView('configuracoes')} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        </div>
      </div>
      

    </nav>
  </>
);
}

function NavItem({ icon: Icon, label, active, isCollapsed, className = "", onClick, badge, toggleSidebar }: { icon: any, label: string, active?: boolean, isCollapsed?: boolean, className?: string, onClick?: () => void, badge?: string, toggleSidebar?: () => void }) {
  return (
    <button onClick={() => {
      if (onClick) onClick();
      if (toggleSidebar && !isCollapsed) toggleSidebar();
    }} className={`relative w-full flex items-center rounded-2xl transition-all duration-300 group/item ${isCollapsed ? 'justify-center p-3.5' : 'gap-3.5 px-4 py-3'} ${className} ${active ? 'bg-[#111111] text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] z-10' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111111]'}`}>
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
