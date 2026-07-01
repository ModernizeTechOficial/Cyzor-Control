import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Users, 
  CreditCard, 
  Server, 
  Activity, 
  Shield, 
  LogOut, 
  Package, 
  Settings, 
  Cpu, 
  Code, 
  CircleDot
} from 'lucide-react';
import { View } from '../../../types.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useEvents } from '../../../context/EventContext.tsx';
import EventDrawer from '../../../components/layout/EventDrawer.tsx';

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  currentView: View | string;
  setCurrentView: (view: View) => void;
}

export default function AdminSidebar({ isCollapsed, toggleSidebar, currentView, setCurrentView }: AdminSidebarProps) {
  const { logout, user } = useAuth();
  const { getPulseState, getBadgeCount } = useEvents();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'deploys' | 'users' | 'billing' | 'infrastructure' | 'logs' | 'all'>('all');

  const onOpenEvents = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    setDrawerOpen(true);
  };

  const renderStatusDot = (itemId: string) => {
    const pulseColor = getPulseState(itemId);
    let pulseClass = 'bg-emerald-500 border-emerald-400 animate-pulse-slow';
    let titleText = 'Módulo saudável e monitorado em tempo real';

    if (pulseColor === 'blue') {
      pulseClass = 'bg-blue-500 border-blue-400 animate-pulse-soft';
      titleText = 'Atividade recente detectada';
    } else if (pulseColor === 'yellow') {
      pulseClass = 'bg-amber-500 border-amber-400 animate-pulse-moderate';
      titleText = 'Aviso pendente: Requer atenção';
    } else if (pulseColor === 'red') {
      pulseClass = 'bg-rose-500 border-rose-400 animate-pulse-intense';
      titleText = 'Problema crítico detectado';
    }

    // Map itemId to Category
    let category: typeof selectedCategory = 'all';
    if (itemId === 'admin-tenants') category = 'deploys';
    else if (itemId === 'admin-users') category = 'users';
    else if (itemId === 'admin-finance' || itemId === 'admin-billing') category = 'billing';
    else if (itemId === 'admin-infrastructure') category = 'infrastructure';
    else if (itemId === 'admin-logs') category = 'logs';

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (category !== 'all') {
            onOpenEvents(category);
          }
        }}
        title={`${titleText} (Clique para ver eventos)`}
        className={`w-2 h-2 rounded-full ${pulseClass} shrink-0 cursor-pointer relative group/dot`}
        aria-label={titleText}
      >
        <span className="absolute -inset-1 rounded-full opacity-0 group-hover/dot:opacity-100 transition-opacity bg-black/5" />
      </button>
    );
  };

  const renderBadgeCount = (itemId: string) => {
    const count = getBadgeCount(itemId);
    if (count === 0) return null;

    let category: typeof selectedCategory = 'all';
    if (itemId === 'admin-tenants') category = 'deploys';
    else if (itemId === 'admin-users') category = 'users';
    else if (itemId === 'admin-finance' || itemId === 'admin-billing') category = 'billing';
    else if (itemId === 'admin-infrastructure') category = 'infrastructure';
    else if (itemId === 'admin-logs') category = 'logs';

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenEvents(category);
        }}
        title={`Possui ${count} eventos recentes (Clique para expandir)`}
        className="ml-1.5 px-2 py-0.5 text-[8px] font-extrabold font-mono bg-zinc-950 hover:bg-indigo-600 text-white rounded-full transition-all shrink-0 active:scale-90"
      >
        {count}
      </button>
    );
  };

  const categories = [
    {
      title: 'Platform',
      items: [
        { id: 'admin', icon: LayoutDashboard, label: 'Platform HQ' },
        { id: 'admin-tenants', icon: Server, label: 'SaaS Tenants' },
      ]
    },
    {
      title: 'Business',
      items: [
        { id: 'admin-companies', icon: Briefcase, label: 'Empresas Clientes' },
        { id: 'admin-users', icon: Users, label: 'Usuários Globais' },
      ]
    },
    {
      title: 'Billing',
      items: [
        { id: 'admin-finance', icon: CreditCard, label: 'Resumo Financeiro' },
        { id: 'admin-plans', icon: Package, label: 'Planos Catálogo' },
        { id: 'admin-billing', icon: CreditCard, label: 'Stripe Gateway' },
      ]
    },
    {
      title: 'Infrastructure',
      items: [
        { id: 'admin-infrastructure', icon: Cpu, label: 'Instâncias & Nodes', isBeta: true },
      ]
    },
    {
      title: 'Security',
      items: [
        { id: 'admin-logs', icon: Activity, label: 'Logs & Auditoria', isBeta: true },
      ]
    },
    {
      title: 'Developer',
      items: [
        { id: 'dev-playground', icon: Code, label: 'Webhooks & API', isBeta: true },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'admin-settings', icon: Settings, label: 'Configurações Core' },
      ]
    }
  ];

  return (
    <aside className={`bg-[#FAFAFB] border-r border-[#ECECEF] text-zinc-700 flex flex-col transition-all duration-300 relative z-20 h-screen ${isCollapsed ? 'w-[72px]' : 'w-[250px]'}`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#ECECEF] shrink-0 bg-white">
        <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center shrink-0 shadow-sm border border-zinc-800">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-xs tracking-tight text-zinc-900 leading-tight">CYZOR HQ</span>
              <span className="text-[9px] uppercase tracking-widest text-indigo-600 font-bold">Platform Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List grouped by Category */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200">
        {categories.map((category) => (
          <div key={category.title} className="space-y-0.5">
            {!isCollapsed && (
              <h3 className="px-2 text-[9px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                {category.title}
              </h3>
            )}
            <div className="space-y-[2px]">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    title={isCollapsed ? item.label : ''}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all group relative ${
                      isActive 
                        ? 'bg-zinc-200/60 text-zinc-950 font-medium' 
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/25'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={14} className={`shrink-0 transition-transform duration-300 ${isActive ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-zinc-700'}`} />
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] tracking-tight whitespace-nowrap truncate">{item.label}</span>
                          {renderStatusDot(item.id)}
                        </div>
                        <div className="flex items-center">
                          {item.isBeta && (
                            <span className="text-[8px] font-semibold tracking-wider px-1 py-0.2 rounded bg-zinc-200/80 text-zinc-500 shrink-0 scale-90">
                              Beta
                            </span>
                          )}
                          {renderBadgeCount(item.id)}
                        </div>
                      </div>
                    )}

                    {/* Simple indicator on collapsed state */}
                    {isCollapsed && isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-zinc-950 rounded-l" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile, Version & Environment Section */}
      <div className="p-3 border-t border-[#ECECEF] shrink-0 bg-white space-y-3">
        {/* User Profile Info */}
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 p-1.5 bg-[#FAFAFB] rounded-xl border border-[#ECECEF]">
            <img 
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
              alt="Admin avatar" 
              className="w-7 h-7 rounded-full bg-zinc-100 border border-[#ECECEF] object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-zinc-900 truncate leading-none mb-0.5">{user?.displayName || 'Diego'}</span>
              <span className="text-[8px] text-zinc-400 font-mono tracking-wider truncate uppercase">Super Administrator</span>
            </div>
          </div>
        )}

        {/* System Info & Status Block */}
        {!isCollapsed && (
          <div className="px-1.5 py-0.5 flex items-center justify-between text-[9px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <CircleDot size={8} className="text-emerald-500 fill-emerald-500 animate-pulse" />
              v4.12.0
            </span>
            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.2 rounded border border-emerald-100">
              Production
            </span>
          </div>
        )}

        <button
          onClick={logout}
          title={isCollapsed ? "Desconectar" : ""}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-zinc-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={14} className="shrink-0 text-zinc-400 group-hover:text-rose-500" />
          {!isCollapsed && <span className="text-[11px] font-bold">Desconectar</span>}
        </button>
      </div>

      <EventDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={selectedCategory}
        onNavigateToView={(view) => setCurrentView(view as any)}
      />
    </aside>
  );
}
