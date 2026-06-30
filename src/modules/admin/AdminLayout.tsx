import React, { useState } from 'react';
import { View } from '../../types.ts';
import AdminSidebar from './components/AdminSidebar.tsx';
import AdminTopbar from './components/AdminTopbar.tsx';
import PlatformAdminDashboard from './views/PlatformAdminDashboard.tsx';
import TenantsAdminView from './views/TenantsAdminView.tsx';
import UsersAdminView from './views/UsersAdminView.tsx';
import FinanceAdminView from './views/FinanceAdminView.tsx';

interface AdminLayoutProps {
  currentView: View | string;
  setCurrentView: (view: View) => void;
}

export default function AdminLayout({ currentView, setCurrentView }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans relative flex">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <div className={`transition-all duration-300 flex-1 flex flex-col min-w-0 h-screen overflow-hidden`}>
        <AdminTopbar 
          isSidebarCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          setCurrentView={setCurrentView}
        />
        
        <main className="flex-1 overflow-y-auto pt-4 px-6 md:px-8 pb-12 w-full">
          {currentView === 'admin' && <PlatformAdminDashboard />}
          {currentView === 'admin-tenants' && <TenantsAdminView />}
          {currentView === 'admin-users' && <UsersAdminView />}
          {currentView === 'admin-finance' && <FinanceAdminView />}
          {/* add more admin views here */}
          {['admin-infrastructure', 'admin-logs'].includes(currentView as string) && (
            <div className="flex items-center justify-center h-64 border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 font-medium">Módulo em construção</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
