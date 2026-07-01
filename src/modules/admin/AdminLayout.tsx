import React, { useState, useEffect, useCallback } from 'react';
import { View } from '../../types.ts';
import AdminSidebar from './components/AdminSidebar.tsx';
import AdminTopbar from './components/AdminTopbar.tsx';
import PlatformAdminDashboard from './views/PlatformAdminDashboard.tsx';
import TenantsAdminView from './views/TenantsAdminView.tsx';
import CompaniesAdminView from './views/CompaniesAdminView.tsx';
import UsersAdminView from './views/UsersAdminView.tsx';
import FinanceAdminView from './views/FinanceAdminView.tsx';
import { PlansAdminView } from './views/PlansAdminView.tsx';
import { BillingAdminView } from './views/BillingAdminView.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminLayoutProps {
  currentView: View | string;
  setCurrentView: (view: View) => void;
}

export default function AdminLayout({ currentView, setCurrentView }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { fetchWithAuth } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      const res = await fetchWithAuth('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error("Failed to load admin metrics", error);
    } finally {
      setLoadingMetrics(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

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
          {currentView === 'admin' && (
            <PlatformAdminDashboard 
              metrics={metrics} 
              loading={loadingMetrics} 
              onRefresh={loadMetrics} 
            />
          )}
          {currentView === 'admin-tenants' && <TenantsAdminView />}
          {currentView === 'admin-companies' && <CompaniesAdminView />}
          {currentView === 'admin-users' && <UsersAdminView />}
          {currentView === 'admin-finance' && <FinanceAdminView />}
          {currentView === 'admin-plans' && <PlansAdminView />}
          {currentView === 'admin-billing' && <BillingAdminView />}
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
