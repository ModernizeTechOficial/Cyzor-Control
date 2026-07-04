import React, { useState } from 'react';
import { Menu, Bell, Search, LogOut, Sparkles, Command, Check, CircleAlert, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { View } from '../../../types.ts';

interface AdminTopbarProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setCurrentView: (view: View) => void;
}

export default function AdminTopbar({ isSidebarCollapsed, toggleSidebar, setCurrentView }: AdminTopbarProps) {
  const { user } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <header className="h-16 bg-[#F3F4F6] flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-950 md:hidden"
          title="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>
        
        {/* Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <span>Dashboard</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 font-semibold">Overview</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-gray-200 transition-all w-64 max-w-sm shadow-sm">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-xs text-gray-800 w-full placeholder:text-gray-400 font-medium"
          />
          <kbd className="text-[10px] bg-gray-50 text-gray-400 font-mono px-1.5 py-0.5 rounded border border-gray-200 select-none shrink-0 flex items-center gap-0.5">
            <Command size={10} />K
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotificationModal(!showNotificationModal)}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-gray-950 relative shadow-sm"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {showNotificationModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 animate-in slide-in-from-top-2 duration-200 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Notifications</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900">System Update</p>
                    <p className="text-[10px] text-gray-500">All systems operational.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center">
          <button onClick={() => setCurrentView('dashboard')} className="rounded-full overflow-hidden border border-gray-200 shadow-sm hover:ring-2 hover:ring-gray-200 transition-all">
            <img 
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
              alt="User profile" 
              className="w-8 h-8 bg-gray-100" 
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
