import React from 'react';
import { LayoutDashboard, Building2, Briefcase, Users, CreditCard, Server, Activity, Shield, LogOut, Package, Settings, Cpu } from 'lucide-react';
import { View } from '../../../types.ts';
import { useAuth } from '../../../context/AuthContext.tsx';

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  currentView: View | string;
  setCurrentView: (view: View) => void;
}

export default function AdminSidebar({ isCollapsed, toggleSidebar, currentView, setCurrentView }: AdminSidebarProps) {
  const { logout } = useAuth();
  const navItems = [
    { id: 'admin', icon: LayoutDashboard, label: 'Platform HQ', badge: 'Core' },
    { id: 'admin-tenants', icon: Server, label: 'Workspaces (SaaS)', badge: 'DB' },
    { id: 'admin-companies', icon: Briefcase, label: 'Empresas Clientes' },
    { id: 'admin-users', icon: Users, label: 'Usuários' },
    { id: 'admin-finance', icon: CreditCard, label: 'Financeiro' },
    { id: 'admin-plans', icon: Package, label: 'Planos Catalogo' },
    { id: 'admin-billing', icon: CreditCard, label: 'Billing Stripe', badge: 'Live' },
    { id: 'admin-settings', icon: Settings, label: 'Configurações Core' },
    { id: 'admin-infrastructure', icon: Server, label: 'Infraestrutura', isBeta: true },
    { id: 'admin-logs', icon: Activity, label: 'Logs & Auditoria', isBeta: true },
  ];

  return (
    <aside className={`bg-[#0A0A0C] border-r border-[#18181B] text-zinc-200 flex flex-col transition-all duration-300 relative z-20 h-screen shadow-2xl ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-[#18181B] shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-sm tracking-tight text-zinc-100 leading-tight">CYZOR PLATFORM</span>
              <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-extrabold">ADMIN CENTRAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-indigo-500/10 text-white border-l-2 border-indigo-500 font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#121215]'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
              
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-xs tracking-wide whitespace-nowrap truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 scale-90">
                      {item.badge}
                    </span>
                  )}
                  {item.isBeta && (
                    <span className="text-[8px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 shrink-0 scale-90">
                      Soon
                    </span>
                  )}
                </div>
              )}

              {/* Glowing active bar in collapsed state */}
              {isCollapsed && isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-l" />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Telemetry & Logout */}
      <div className="p-4 border-t border-[#18181B] shrink-0 bg-[#070709] space-y-4">
        {!isCollapsed && (
          <div className="p-3 bg-[#111113] rounded-xl border border-[#1E1E22] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Cpu size={12} className="text-emerald-400" /> Platform CPU</span>
              <span className="font-mono text-zinc-300 font-bold">12%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[12%]" />
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest pt-0.5">
              <span>Nodes: 3 Active</span>
              <span className="text-emerald-400">Stable</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="shrink-0 text-zinc-400 group-hover:text-rose-400" />
          {!isCollapsed && <span className="text-xs font-semibold">Desconectar</span>}
        </button>
      </div>
    </aside>
  );
}
