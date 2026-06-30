import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
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
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 bg-gray-50/50 border border-gray-200/60 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all w-96 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('dashboard')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          Exit to Tenant
        </button>
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-2" />
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{user?.displayName || 'Admin'}</span>
            <span className="text-xs text-gray-500 font-medium">Platform Admin</span>
          </div>
          <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} alt="Admin" className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm" />
        </div>
      </div>
    </header>
  );
}
