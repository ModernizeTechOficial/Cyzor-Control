import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// Hook adapter: exposes "Empresa" fields to the UI while using internal Workspace
export const useBusinessContext = () => {
  const { activeWorkspace, user, workspaces } = useAuth();

  const business = useMemo(() => {
    const ws = activeWorkspace || (workspaces && workspaces.length ? workspaces[0] : undefined);
    if (!ws) return {
      companyId: undefined,
      companyName: undefined,
      companySlug: undefined,
      companyLogo: undefined,
      companyPlan: undefined,
      companyPermissions: undefined,
      companySettings: undefined,
      workspace: undefined
    };

    return {
      companyId: ws.id,
      companyName: ws.name,
      companySlug: ws.slug || ws.name?.toLowerCase().replace(/\s+/g, '-'),
      companyLogo: ws.logoUrl || ws.coverUrl || ws.logo || undefined,
      companyPlan: ws.plan || ws.subscription || undefined,
      companyPermissions: ws.permissions || ws.role || undefined,
      companySettings: ws.settings || ws.configuration || {},
      workspace: ws
    };
  }, [activeWorkspace, workspaces]);

  return business as {
    companyId?: number | string;
    companyName?: string;
    companySlug?: string;
    companyLogo?: string;
    companyPlan?: any;
    companyPermissions?: any;
    companySettings?: any;
    workspace?: any;
  };
};

export default useBusinessContext;
