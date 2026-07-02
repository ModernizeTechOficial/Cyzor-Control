import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { useAuth } from '../context/AuthContext.tsx';
import { useBranding } from '../hooks/useBranding.ts';
import { useNavigation } from '../context/NavigationContext.tsx';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Package, 
  GitBranch, 
  Lightbulb, 
  FileText, 
  DollarSign, 
  BotMessageSquare, 
  Settings, 
  Calendar, 
  ShieldCheck, 
  StickyNote, 
  Workflow, 
  Cpu, 
  Shield, 
  Terminal, 
  Activity,
  Layers
} from 'lucide-react';
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
  const { activeWorkspace, dbUser, logout } = useAuth();
  const { iconUrl, iconSize, appName } = useBranding();
  const { badges } = useNavigation();
  const currentPlan = dbUser?.currentPlan || 'free';

  const getTrialDaysLeft = () => {
    if (!dbUser?.trialEndsAt) return null;
    const ends = new Date(dbUser.trialEndsAt);
    const now = new Date();
    const diff = ends.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const trialDaysLeft = getTrialDaysLeft();

  // Categorized Navigation Sections
  const categories = [
    {
      id: 'platform',
      title: 'Platform',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as View }
      ]
    },
    {
      id: 'business',
      title: 'Business2',
      items: [
        { id: 'empresas', label: 'Empresas', icon: Building2, view: 'empresas' as View },
        { id: 'clientes', label: 'Clientes', icon: Users, view: 'clientes' as View },
        { id: 'produtos', label: 'Produtos', icon: Package, view: 'produtos' as View },
        { id: 'projetos', label: 'Projetos', icon: GitBranch, view: 'projetos' as View, badge: badges.projetos > 0 ? badges.projetos.toString() : undefined },
        { id: 'ideias', label: 'Ideias', icon: Lightbulb, view: 'ideias' as View },
        { id: 'documentacao', label: 'Documentação', icon: FileText, view: 'documentacao' as View }
      ]
    },
    {
      id: 'billing',
      title: 'Billing',
      items: [
        { id: 'financeiro', label: 'Financeiro', icon: DollarSign, view: 'financeiro' as View, badge: badges.financeiro > 0 ? badges.financeiro.toString() : undefined }
      ]
    },
    {
      id: 'developer',
      title: 'Developer',
      items: [
        { id: 'flow-builder', label: 'Flow Builder', icon: Workflow, view: 'flow-builder' as View },
        { id: 'agenda', label: 'Agenda', icon: Calendar, view: 'agenda' as View },
        { id: 'keep', label: 'Google Keep', icon: StickyNote, view: 'keep' as View }
      ]
    },
    {
      id: 'security-ai',
      title: 'Security & AI',
      items: [
        { id: 'ia', label: 'IA Intelligence', icon: BotMessageSquare, view: 'ia' as View, badge: badges.ia > 0 ? badges.ia.toString() : undefined }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      items: [
        { id: 'configuracoes', label: 'Configurações', icon: Settings, view: 'configuracoes' as View },
        ...(dbUser?.isPlatformAdmin ? [
          { id: 'admin', label: 'Admin Cyzor', icon: ShieldCheck, view: 'admin' as View }
        ] : [])
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-[#0F172A]/10 backdrop-blur-[2px] z-30 lg:hidden transition-all animate-in fade-in duration-200" 
          onClick={toggleSidebar}
        />
      )}

      <nav className={`fixed left-0 top-0 h-screen flex flex-col py-5 border-r border-[#0F172A05] bg-[#FAFAFB] lg:rounded-r-[24px] shadow-[1px_0_10px_rgba(0,0,0,0.01)] z-40 transition-all duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[80px] px-2.5' : 'translate-x-0 w-[260px] px-5'}`}>
        
        {/* Workspace Brand Header */}
        <div className={`flex items-center mb-6 px-1.5 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt="Logo" 
                width={iconSize || 28} 
                height={iconSize || 28} 
                className="object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = "w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center text-white font-bold text-sm";
                    placeholder.innerText = appName.charAt(0);
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {appName.charAt(0)}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#111111] tracking-tight whitespace-nowrap">{appName}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${currentPlan === 'free' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-800'}`}>
                  {currentPlan}
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] font-medium truncate max-w-[150px]" title={activeWorkspace?.name}>
                {activeWorkspace?.name || 'Workspace Principal'}
              </span>
            </div>
          )}
        </div>

        {/* Free Trial Panel */}
        {!isCollapsed && currentPlan === 'free' && trialDaysLeft !== null && (
          <div className="mb-4 px-1.5">
            <div className="bg-amber-50/50 border border-amber-100/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Teste Grátis</span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">{trialDaysLeft}d restantes</span>
              </div>
              <div className="h-1 w-full bg-amber-100/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${(trialDaysLeft / 14) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Categorized Scrollable Nav Items */}
        <div id="sidebar-nav" className="flex flex-col gap-5 w-full flex-1 overflow-y-auto overflow-x-hidden pr-0.5 custom-scrollbar">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-2.5 py-1 select-none">
                  {cat.title}
                </span>
              )}
              <div className="flex flex-col gap-[2px]">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.view);
                      if (toggleSidebar && !isCollapsed) toggleSidebar();
                    }}
                    className={`relative w-full flex items-center rounded-xl transition-all duration-200 group/item ${
                      isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
                    } ${
                      currentView === item.view 
                        ? 'bg-[#111111]/5 text-[#111111] font-bold' 
                        : 'text-[#64748B] hover:bg-[#F1F5F9]/50 hover:text-[#111111]'
                    }`}
                  >
                    <item.icon 
                      size={15} 
                      className={`flex-shrink-0 ${
                        currentView === item.view ? "text-[#111111]" : "text-[#94A3B8] group-hover/item:text-[#111111] transition-colors"
                      }`} 
                      strokeWidth={currentView === item.view ? 2.5 : 2} 
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 overflow-hidden">
                        <span className="text-[13px] whitespace-nowrap overflow-hidden text-ellipsis tracking-tight font-medium">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] flex items-center justify-center border transition-all ${
                            currentView === item.view 
                              ? 'bg-neutral-800 text-white border-neutral-800' 
                              : 'bg-white text-[#64748B] border-[#0F172A08] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {isCollapsed && item.badge && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Metadata & System Status Panel */}
        <div className="mt-auto pt-3 border-t border-[#0F172A05] flex flex-col gap-2">
          {!isCollapsed ? (
            <div className="flex flex-col gap-2.5 px-1.5">
              {/* Environment Indicator */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFFFF] border border-[#0F172A03] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">Production</span>
                </div>
                <span className="text-[9px] font-mono text-[#94A3B8] font-bold">v1.2.0</span>
              </div>

              {/* Minimal User Profile Info */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#0F172A08] overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-800 shadow-sm flex-shrink-0">
                  {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : (dbUser?.email ? dbUser.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[#111111] truncate">{dbUser?.name || 'Operador'}</span>
                  <span className="text-[9px] text-[#64748B] truncate">{dbUser?.email || 'cyzor@infrastructure'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" title="Production Ativa" />
              <div className="w-6 h-6 rounded-lg bg-[#FFFFFF] border border-[#0F172A08] flex items-center justify-center text-[10px] font-bold text-neutral-800 shadow-sm">
                {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : (dbUser?.email ? dbUser.email.charAt(0).toUpperCase() : 'U')}
              </div>
            </div>
          )}
        </div>

      </nav>
    </>
  );
}

