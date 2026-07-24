import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspacePermissions } from '../hooks/usePermissions';

// ============================================================================
// BOTTOM BAR - Mobile navigation with module-aware filtering
// ============================================================================

export default function BottomBar({ currentView, setCurrentView }: any) {
  const { user } = useAuth();
  const { canViewFinance } = useWorkspacePermissions();

  const allMainTabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'projetos', label: 'Projetos', icon: '📁' },
    { id: 'crm', label: 'CRM', icon: '👥' },
    { id: 'financeiro', label: 'Financeiro', icon: '💰' },
    { id: 'agenda', label: 'Agenda', icon: '📅' },
    { id: 'ia', label: 'IA', icon: '✨' },
    { id: 'configuracoes', label: 'Ajustes', icon: '⚙️' },
  ];

  // Filter tabs based on permissions
  const visibleTabs = allMainTabs.filter((tab) => {
    if (tab.id === 'financeiro' && !canViewFinance) return false;
    return true;
  });

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`
              flex flex-col items-center justify-center gap-0.5
              py-2 px-3 flex-1
              transition-colors
              ${currentView === tab.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
