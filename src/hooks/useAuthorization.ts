import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authorizationEngine,
  policyEngine,
  moduleRegistry,
  featureFlagService,
  AuthorizationContext,
  PermissionSlug,
  ResourceSlug,
  ActionSlug,
  ModuleSlug,
} from '../lib/bos';

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
  const { user, dbUser, activeWorkspace } = useAuth();
  const queryClient = useQueryClient();
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

  // -------------------------------------------------------------------------
  // CORE AUTHORIZATION
  // -------------------------------------------------------------------------

  const can = useCallback(
    async (permission: PermissionSlug, resourceType?: string, resourceId?: number): Promise<boolean> => {
      if (!context) return false;
      const result = await authorizationEngine.can(context, permission, resourceType, resourceId);
      return result.allowed;
    },
    [context]
  );

  const cannot = useCallback(
    async (permission: PermissionSlug, resourceType?: string, resourceId?: number): Promise<boolean> => {
      if (!context) return true;
      const result = await authorizationEngine.cannot(context, permission, resourceType, resourceId);
      return result.allowed;
    },
    [context]
  );

  const hasRole = useCallback(async (role: string): Promise<boolean> => {
    if (!context) return false;
    return authorizationEngine.hasRole(context, role);
  }, [context]);

  const hasPermission = useCallback(async (permission: PermissionSlug): Promise<boolean> => {
    if (!context) return false;
    return authorizationEngine.hasPermission(context, permission);
  }, [context]);

  const hasFeature = useCallback(async (featureKey: string): Promise<boolean> => {
    if (!context) return false;
    return authorizationEngine.hasFeature(context, featureKey);
  }, [context]);

  const getEffectivePermissions = useCallback(async (): Promise<Set<PermissionSlug>> => {
    if (!context) return new Set();
    const result = await authorizationEngine.getEffectivePermissions(context);
    return result.combined;
  }, [context]);

  const getAccessibleModules = useCallback(async (): Promise<ModuleSlug[]> => {
    if (!context) return [];
    return authorizationEngine.getAccessibleModules(context);
  }, [context]);

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
  const { user, activeWorkspace } = useAuth();
  const { data: permissions = new Set<string>(), isLoading } = useQuery({
    queryKey: ['permissions', user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return new Set<string>();
      const context = {
        userId: user.uid,
        tenantId: activeWorkspace.tenantId || '',
        workspaceId: activeWorkspace.id,
      };
      const result = await authorizationEngine.getEffectivePermissions(context);
      return Array.from(result.combined);
    },
    enabled: !!user && !!activeWorkspace,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    permissions: new Set(permissions),
    isLoading,
    hasPermission: (perm: string) => permissions.includes(perm),
  };
}

// ============================================================================
// MODULE QUERY HOOK
// ============================================================================

export function useModules() {
  const { user, activeWorkspace } = useAuth();
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules', user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return [];
      const context = {
        userId: user.uid,
        tenantId: activeWorkspace.tenantId || '',
        workspaceId: activeWorkspace.id,
      };
      return moduleRegistry.getActiveModules(context.tenantId);
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
  const { user, activeWorkspace } = useAuth();
  const { data: enabled = false, isLoading } = useQuery({
    queryKey: ['feature', featureKey, user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return false;
      return featureFlagService.isEnabled(
        featureKey,
        activeWorkspace.tenantId,
        activeWorkspace.id
      );
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
  const { user, activeWorkspace } = useAuth();
  const { data: allowed = false, isLoading } = useQuery({
    queryKey: ['policy', resource, action, user?.uid, activeWorkspace?.id],
    queryFn: async () => {
      if (!user || !activeWorkspace) return false;
      const context = {
        userId: user.uid,
        tenantId: activeWorkspace.tenantId || '',
        workspaceId: activeWorkspace.id,
      };
      const result = await policyEngine.can(context, resource, action);
      return result.allowed;
    },
    enabled: !!user && !!activeWorkspace,
    staleTime: 5 * 60 * 1000,
  });

  return { allowed, isLoading };
}
