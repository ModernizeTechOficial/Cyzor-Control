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
  CircleDot,
  ChevronDown,
  Layers,
  Inbox,
  PieChart,
  MessageSquare,
  BarChart,
  Megaphone,
  CreditCard as IntegrationsIcon,
  HelpCircle
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
      <span
        onClick={(e) => {
          e.stopPropagation();
          if (category !== 'all') {
            onOpenEvents(category);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            if (category !== 'all') {
              onOpenEvents(category);
            }
          }
        }}
        title={`${titleText} (Clique para ver eventos)`}
        className={`w-2 h-2 rounded-full ${pulseClass} shrink-0 cursor-pointer relative group/dot inline-block`}
        aria-label={titleText}
        role="button"
        tabIndex={0}
      >
        <span className="absolute -inset-1 rounded-full opacity-0 group-hover/dot:opacity-100 transition-opacity bg-black/5" />
      </span>
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
      <span
        onClick={(e) => {
          e.stopPropagation();
          onOpenEvents(category);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            onOpenEvents(category);
          }
        }}
        title={`Possui ${count} eventos recentes (Clique para expandir)`}
        className="ml-1.5 px-2 py-0.5 text-[8px] font-extrabold font-mono bg-zinc-950 hover:bg-indigo-600 text-white rounded-full transition-all shrink-0 active:scale-90 cursor-pointer inline-block"
        role="button"
        tabIndex={0}
      >
        {count}
      </span>
    );
  };

  const categories = [
    {
      title: 'Main Menu',
      items: [
        { id: 'admin', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'admin-tenants', icon: Layers, label: 'Products' },
        { id: 'admin-billing', icon: Inbox, label: 'Transactions' },
        { id: 'admin-finance', icon: PieChart, label: 'Reports & Analytics' },
      ]
    },
    {
      title: 'Customers',
      items: [
        { id: 'admin-users', icon: Users, label: 'Customer List' },
        { id: 'admin-companies', icon: Briefcase, label: 'Channels' },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'admin-settings', icon: Shield, label: 'Roles & Permissions' },
        { id: 'admin-plans', icon: IntegrationsIcon, label: 'Billing & Subscription' },
        { id: 'admin-bes', icon: BarChart, label: 'BES Management' },
        { id: 'dev-playground', icon: Code, label: 'Integrations', isBeta: true },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'admin-ai-control-center', icon: Cpu, label: 'AI Control Center' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'admin-logs', icon: HelpCircle, label: 'Customer Support', isBeta: true },
        { id: 'admin-infrastructure', icon: Settings, label: 'System Settings', isBeta: true },
      ]
    }
  ];

  return (
    <aside className={`bg-[#F3F4F6] text-gray-600 flex flex-col transition-all duration-300 relative z-20 h-screen ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      {/* Brand Header */}
      <div className="flex items-center h-20 px-5 shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden bg-white/50 p-2 rounded-xl border border-gray-200 w-full hover:bg-white transition-colors cursor-pointer shadow-sm ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-gray-500 font-medium leading-none mb-0.5">Agency</span>
              <span className="font-bold text-xs tracking-tight text-gray-900 leading-none truncate">Spark Pixel Team</span>
            </div>
          )}
          {!isCollapsed && <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Nav List grouped by Category */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 mt-2">
        {categories.map((category) => (
          <div key={category.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold text-gray-500 select-none mb-2">
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative ${
                      isActive 
                        ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-gray-900 font-semibold' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="text-[13px] tracking-tight whitespace-nowrap truncate">{item.label}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 shrink-0 mb-2">
        <div className={`flex items-center p-2 rounded-xl border border-transparent hover:bg-gray-200/50 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5">
            <img 
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
              alt="Admin avatar" 
              className="w-8 h-8 rounded-full bg-gray-100 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-gray-900 truncate leading-none mb-0.5">{user?.displayName || 'Salung Prastyo'}</span>
                <span className="text-[9px] text-gray-500 tracking-wide truncate">Sales Operator</span>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronDown size={14} className="text-gray-400" />}
        </div>
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
