import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export type PermissionSlug = string;
export type ResourceSlug = string;
export type ActionSlug = string;
export type ModuleSlug = string;

export interface AuthorizationContext {
  userId: string;
  tenantId: string;
  workspaceId: number;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

// ============================================================================
// TYPES
// ============================================================================

export interface UseAuthorizationResult {
  can: (permission: PermissionSlug, resourceType?: string, resourceId?: number) => Promise<boolean>;
  cannot: (permission: PermissionSlug, resourceType?: string, resourceId?: number) => Promise<boolean>;
  hasRole: (role: string) => Promise<boolean>;
  hasPermission: (permission: PermissionSlug) => Promise<boolean>;
  hasFeature: (featureKey: string) => Promise<boolean>;
  getEffectivePermissions: () => Promise<Set<PermissionSlug>>;
  getAccessibleModules: () => Promise<ModuleSlug[]>;
  loading: boolean;
  context: AuthorizationContext | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuthorization(): UseAuthorizationResult {
  const { user, dbUser, activeWorkspace, fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<AuthorizationContext | null>(null);

  // Build authorization context
  const authContext: AuthorizationContext | null = useMemo(() => {
    if (!user || !activeWorkspace) return null;
    return {
      userId: user.uid,
      tenantId: dbUser?.activeTenantId || activeWorkspace.tenantId || '',
      workspaceId: activeWorkspace.id,
      tenant: dbUser?.tenant || undefined,
    };
  }, [user, dbUser, activeWorkspace]);

  useEffect(() => {
    if (authContext) {
      setContext(authContext);
    } else {
      setContext(null);
    }
  }, [authContext]);

  const apiFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!fetchWithAuth) {
      throw new Error('fetchWithAuth is unavailable');
    }
    const response = await fetchWithAuth(path, init);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error (${response.status}): ${text}`);
    }
    return response.json();
  }, [fetchWithAuth]);

  const can = useCallback(async (permission: PermissionSlug, resourceType?: string, resourceId?: number): Promise<boolean> => {
    if (!context) return false;
    const query = new URLSearchParams({ permission });
    if (resourceType) query.set('resourceType', resourceType);
    if (resourceId !== undefined) query.set('resourceId', String(resourceId));
    const result = await apiFetch(`/api/auth/can?${query.toString()}`);
    return result.allowed === true;
  }, [context, apiFetch]);

  const cannot = useCallback(async (permission: PermissionSlug, resourceType?: string, resourceId?: number): Promise<boolean> => {
    if (!context) return true;
    const allowed = await can(permission, resourceType, resourceId);
    return !allowed;
  }, [context, can]);

  const hasRole = useCallback(async (_role: string): Promise<boolean> => {
    return false;
  }, []);

  const hasPermission = useCallback(async (permission: PermissionSlug): Promise<boolean> => {
    if (!context) return false;
    return can(permission);
  }, [context, can]);

  const hasFeature = useCallback(async (featureKey: string): Promise<boolean> => {
    if (!context) return false;
    const result = await apiFetch(`/api/auth/features/${encodeURIComponent(featureKey)}`);
    return result.enabled === true;
  }, [context, apiFetch]);

  const getEffectivePermissions = useCallback(async (): Promise<Set<PermissionSlug>> => {
    if (!context) return new Set();
    const result = await apiFetch('/api/auth/effective-permissions');
    return new Set<string>(result.permissions || []);
  }, [context, apiFetch]);

  const getAccessibleModules = useCallback(async (): Promise<ModuleSlug[]> => {
    if (!context) return [];
    const result = await apiFetch('/api/auth/accessible-modules');
    return result.modules || [];
  }, [context, apiFetch]);

  return {
    can,
    cannot,
    hasRole,
    hasPermission,
    hasFeature,
    getEffectivePermissions,
    getAccessibleModules,
    loading,
    context,
  };
}

// ============================================================================
// PERMISSION QUERY HOOK (React Query)
// ============================================================================

export function usePermissions() {
  const { user, activeWorkspace, fetchWithAuth } = useAuth();
  const { data: permissions = new Set<string>(), isLoading } = useQuery({
    queryKey: ['permissions', user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return new Set<string>();
      const response = await fetchWithAuth('/api/auth/effective-permissions');
      const data = await response.json();
      if (!Array.isArray(data.permissions)) return new Set<string>();
      return new Set<string>(data.permissions);
    },
    enabled: !!user && !!activeWorkspace,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    permissions,
    isLoading,
    hasPermission: (perm: string) => permissions.has(perm),
  };
}

// ============================================================================
// MODULE QUERY HOOK
// ============================================================================

export function useModules() {
  const { user, activeWorkspace, fetchWithAuth } = useAuth();
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules', user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return [];
      const response = await fetchWithAuth('/api/auth/accessible-modules');
      const data = await response.json();
      return Array.isArray(data.modules) ? data.modules : [];
    },
    enabled: !!user && !!activeWorkspace,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return { modules, isLoading };
}

// ============================================================================
// FEATURE FLAG HOOK
// ============================================================================

export function useFeature(featureKey: string) {
  const { user, activeWorkspace, fetchWithAuth } = useAuth();
  const { data: enabled = false, isLoading } = useQuery({
    queryKey: ['feature', featureKey, user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return false;
      const response = await fetchWithAuth(`/api/auth/features/${encodeURIComponent(featureKey)}`);
      const data = await response.json();
      return data.enabled === true;
    },
    enabled: !!user && !!activeWorkspace,
    staleTime: 5 * 60 * 1000,
  });

  return { enabled, isLoading };
}

// ============================================================================
// POLICY HOOK
// ============================================================================

export function usePolicy(resource: ResourceSlug, action: ActionSlug) {
  const { user, activeWorkspace, fetchWithAuth } = useAuth();
  const { data: allowed = false, isLoading } = useQuery({
    queryKey: ['policy', resource, action, user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return false;
      const params = new URLSearchParams({ resource, action });
      const response = await fetchWithAuth(`/api/auth/policy?${params.toString()}`);
      const data = await response.json();
      return data.allowed === true;
    },
    enabled: !!user && !!activeWorkspace,
    staleTime: 5 * 60 * 1000,
  });

  return { allowed, isLoading };
}
