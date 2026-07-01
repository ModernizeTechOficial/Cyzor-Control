import React, { useState, useEffect, useCallback } from 'react';
import { Cpu } from 'lucide-react';
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
import GlobalSettingsAdminView from './views/GlobalSettingsAdminView.tsx';
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
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-800 font-sans relative flex overflow-hidden">
      {/* Subtle, premium, light dot grid pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
      </div>

      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <div className={`transition-all duration-300 flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10`}>
        <AdminTopbar 
          isSidebarCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          setCurrentView={setCurrentView}
        />
        
        <main className="flex-1 overflow-y-auto bg-[#FAFAFB] pt-6 px-6 md:px-8 pb-16 w-full scrollbar-thin scrollbar-thumb-zinc-200">
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
          {currentView === 'admin-settings' && <GlobalSettingsAdminView />}
          
          {/* Elegant placeholders for Beta modules */}
          {['admin-infrastructure', 'admin-logs', 'dev-playground'].includes(currentView as string) && (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#ECECEF] rounded-[24px] bg-white p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100">
                <Cpu size={28} className="animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight uppercase font-mono">Módulo em Integração Cloud</h3>
              <p className="text-xs text-zinc-500 max-w-md mt-2 font-sans">
                Este microsserviço Cyzor Core está em processo de provisionamento via cluster Kubernetes. A comunicação com os webhooks em tempo real e orquestradores de segurança estará disponível no próximo ciclo de deploys.
              </p>
              <div className="mt-6 flex gap-3">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
                  Uptime 100%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                  Staging Mode Active
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
