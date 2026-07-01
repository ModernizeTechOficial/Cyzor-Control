import React from 'react';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { View } from '../../../types.ts';

interface AdminTopbarProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setCurrentView: (view: View) => void;
}

export default function AdminTopbar({ isSidebarCollapsed, toggleSidebar, setCurrentView }: AdminTopbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-[#18181B] flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#16161B] rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
        >
          <Menu size={18} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 bg-[#121215]/80 border border-[#1E1E22] rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/60 transition-all w-96 shadow-inner">
          <Search size={16} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar instâncias, logs, webhooks..." 
            className="bg-transparent border-none outline-none text-xs text-zinc-200 w-full placeholder:text-zinc-500 font-medium"
          />
          <kbd className="text-[10px] bg-[#1E1E22] text-zinc-500 font-mono px-1.5 py-0.5 rounded border border-zinc-800">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCurrentView('dashboard')} 
          className="text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg bg-[#121215] border border-[#1E1E22] text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm flex items-center gap-2"
        >
          <LogOut size={12} />
          Voltar ao Tenant
        </button>

        <button className="relative p-2 hover:bg-[#16161B] rounded-lg transition-colors text-zinc-400 hover:text-zinc-100">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#0A0A0C]" />
        </button>

        <div className="h-6 w-[1px] bg-[#18181B]" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-zinc-200 leading-tight">{user?.displayName || 'Admin'}</span>
            <span className="text-[9px] text-indigo-400 font-semibold tracking-widest uppercase">Platform Godmode</span>
          </div>
          <img 
            src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
            alt="Admin" 
            className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 shadow-sm" 
          />
        </div>
      </div>
    </header>
  );
}
