import React from 'react';
import { LayoutDashboard, Building2, Briefcase, Users, CreditCard, Server, Activity, Shield, LogOut } from 'lucide-react';
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
    { id: 'admin', icon: LayoutDashboard, label: 'Platform' },
    { id: 'admin-tenants', icon: Server, label: 'Workspaces (SaaS)' },
    { id: 'admin-companies', icon: Briefcase, label: 'Empresas Clientes' },
    { id: 'admin-users', icon: Users, label: 'Usuários' },
    { id: 'admin-finance', icon: CreditCard, label: 'Financeiro' },
    { id: 'admin-infrastructure', icon: Server, label: 'Infraestrutura' },
    { id: 'admin-logs', icon: Activity, label: 'Logs & Auditoria' },
  ];

  return (
    <aside className={`bg-[#0A0A0A] text-white flex flex-col transition-all duration-300 relative z-20 h-screen shadow-2xl ${isCollapsed ? 'w-[88px]' : 'w-[280px]'}`}>
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/10 shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-base tracking-tight leading-tight">Cyzor Admin</span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-medium">Platform HQ</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
              {!isCollapsed && (
                <span className="font-medium text-sm tracking-wide whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
