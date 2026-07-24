import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspacePermissions } from '../hooks/usePermissions';

// ============================================================================
// SIDEBAR - Module-aware navigation
// ============================================================================

export default function Sidebar({ isCollapsed, toggleSidebar, currentView, setCurrentView }: any) {
  const { user, dbUser, activeWorkspace, fetchWithAuth } = useAuth();
  const { canViewFinance, isLoading: permissionsLoading } = useWorkspacePermissions();
  const [modules, setModules] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load accessible modules from Module Registry
  React.useEffect(() => {
    async function loadModules() {
      if (!user || !activeWorkspace || !fetchWithAuth) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithAuth('/api/auth/accessible-modules');
        if (!response.ok) {
          throw new Error(`Failed to load modules: ${response.status}`);
        }

        const data = await response.json();
        setModules(Array.isArray(data.modules) ? data.modules : []);
      } catch (error) {
        console.error('Error loading modules:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, [user, activeWorkspace, fetchWithAuth]);

  if (loading || permissionsLoading) {
    return (
      <aside className={`
        fixed inset-y-0 left-0 z-50
        bg-white border-r border-gray-200
        transition-all duration-300
        ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}
        flex flex-col
      `}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </aside>
    );
  }

  // Legacy module mapping for backward compatibility
  const moduleIdMap: Record<string, string> = {
    'finance': 'financeiro',
    'crm': 'crm',
    'projects': 'projetos',
    'auth': 'equipe',
    'workspace': 'empresa',
  };

  const moduleLabelMap: Record<string, string> = {
    'finance': 'Financeiro',
    'crm': 'CRM',
    'projects': 'Projetos',
    'auth': 'Equipe',
    'workspace': 'Empresas',
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50
      bg-white border-r border-gray-200
      transition-all duration-300
      ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}
      flex flex-col
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        {isCollapsed ? (
          <span className="text-xl font-bold text-gray-900">C</span>
        ) : (
          <span className="text-lg font-bold text-gray-900 tracking-tight">CYZOR</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Dashboard - always visible when logged in */}
        {user && (
          <NavItem
            icon="home"
            label="Dashboard"
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
            isCollapsed={isCollapsed}
          />
        )}

        {/* Module-based navigation */}
        {modules.map((module) => {
          const moduleId = moduleIdMap[module.slug] || module.slug;
          const label = moduleLabelMap[module.slug] || module.name;

          // Finance guard
          if (module.slug === 'finance' && !canViewFinance) return null;

          return (
            <NavItem
              key={module.slug}
              icon={module.icon || 'box'}
              label={label}
              active={currentView === moduleId}
              onClick={() => setCurrentView(moduleId as any)}
              isCollapsed={isCollapsed}
            />
          );
        })}

        {/* Legacy navigation items (backward compatibility) */}
        {user && (
          <>
            <NavItem
              icon="settings"
              label="Configurações"
              active={currentView === 'configuracoes'}
              onClick={() => setCurrentView('configuracoes')}
              isCollapsed={isCollapsed}
            />
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-100">
        {!isCollapsed && (
          <div className="text-xs text-gray-400 text-center">
            BOS Core v1.0
          </div>
        )}
      </div>
    </aside>
  );
}

// ============================================================================
// NAV ITEM COMPONENT
// ============================================================================

function NavItem({ icon, label, active, onClick, isCollapsed }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200
        ${active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? label : undefined}
    >
      <span className="text-lg">{icon}</span>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </button>
  );
}
