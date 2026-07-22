import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface NavigationBadges {
  projetos: number;
  financeiro: number;
  ia: number;
}

interface GlobalFilters {
  companyId?: string | number;
  projectId?: string | number;
  productId?: string | number;
  clientId?: string | number;
  documentId?: string | number;
  ideaId?: string | number;
  inviteToken?: string;
}

interface NavigationContextType {
  badges: NavigationBadges;
  refreshBadges: () => Promise<void>;
  globalFilters: GlobalFilters;
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { activeWorkspace, fetchWithAuth } = useAuth();
  const [badges, setBadges] = useState<NavigationBadges>({
    projetos: 0,
    financeiro: 0,
    ia: 0
  });
  
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({});

  const refreshBadges = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const response = await fetchWithAuth('/api/navigation/badges');
      if (response.ok) {
        const data = await response.json();
        setBadges(data);
      }
    } catch (error) {
      console.warn('Failed to fetch navigation badges:', error);
    }
  }, [activeWorkspace, fetchWithAuth]);

  useEffect(() => {
    refreshBadges();
    
    // Auto refresh every 2 minutes
    const interval = setInterval(refreshBadges, 120000);
    return () => clearInterval(interval);
  }, [refreshBadges]);

  return (
    <NavigationContext.Provider value={{ badges, refreshBadges, globalFilters, setGlobalFilters }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
