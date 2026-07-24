import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMembers } from './useCyzorQueries';
import { usePermissions as useNewPermissions, useModules, useFeature } from './useAuthorization';

// ============================================================================
// LEGACY COMPATIBILITY HOOKS
// ============================================================================

export function useWorkspacePermissions() {
  const { user, dbUser, activeWorkspace } = useAuth();
  const { data: members = [], isLoading: isMembersLoading } = useMembers();
  const { permissions: bosPermissions, loading: bosLoading } = useNewPermissions();

  const currentMember = useMemo(() => {
    if (!user || !Array.isArray(members)) return null;
    const found = members.find((member: any) => member.uid === user.uid || member.userUid === user.uid) || null;
    if (found) return found;
    if (activeWorkspace?.ownerUid === user.uid) {
      return { uid: user.uid, role: 'OWNER', permissions: [] } as any;
    }
    if (dbUser?.role && String(dbUser.role).toUpperCase().includes('OWNER')) {
      return { uid: user.uid, role: 'OWNER', permissions: [] } as any;
    }
    return null;
  }, [members, user, activeWorkspace, dbUser]);

  const currentPermissions = useMemo(() => {
    if (!currentMember) return new Set<string>();
    const role = currentMember.role || 'MEMBER';
    const permissions = currentMember.permissions || [];
    
    // Use BOS permissions if available, fallback to legacy
    if (bosPermissions.size > 0) {
      return bosPermissions;
    }
    
    // Legacy fallback
    const legacyPerms = getLegacyEffectivePermissions(role, permissions);
    return legacyPerms;
  }, [currentMember, bosPermissions]);

  return {
    currentMember,
    currentPermissions,
    canViewFinance: currentPermissions.has('view_finance') || currentPermissions.has('finance.entries.view'),
    canManageFinance: currentPermissions.has('manage_finance') || currentPermissions.has('finance.entries.manage'),
    canManageMembers: currentPermissions.has('manage_members') || currentPermissions.has('auth.members.manage'),
    canManageSettings: currentPermissions.has('manage_settings') || currentPermissions.has('core.settings.manage'),
    isLoading: isMembersLoading || bosLoading,
    isOwner: currentMember?.role?.toString().toUpperCase().includes('OWNER') || false,
  };
}

// Legacy permission map for backward compatibility
const legacyRolePermissionsMap: Record<string, string[]> = {
  OWNER: ['manage_members', 'create_projects', 'edit_projects', 'delete_projects', 'view_finance', 'manage_finance', 'manage_ai', 'manage_integrations', 'manage_settings', 'create_products', 'publish_products'],
  ADMIN: ['manage_members', 'create_projects', 'edit_projects', 'delete_projects', 'view_finance', 'manage_finance', 'manage_ai', 'manage_integrations', 'manage_settings', 'create_products', 'publish_products'],
  MANAGER: ['create_projects', 'edit_projects', 'view_finance', 'create_products'],
  DEVELOPER: ['edit_projects', 'publish_products'],
  DESIGNER: ['edit_projects'],
  FINANCE: ['view_finance', 'manage_finance'],
  VIEWER: [],
  MEMBER: ['edit_projects']
};

function getLegacyEffectivePermissions(role: string, permissions: any[]): Set<string> {
  const normalized = Array.isArray(permissions) 
    ? Array.from(new Set(permissions.map((p) => String(p).trim())))
    : [];
  
  const rolePerms = legacyRolePermissionsMap[role as keyof typeof legacyRolePermissionsMap] || [];
  
  if (role === 'OWNER') {
    return new Set([...Object.values(legacyRolePermissionsMap).flat(), ...normalized]);
  }
  
  return new Set([...rolePerms, ...normalized]);
}

// ============================================================================
// NEW BOS HOOKS
// ============================================================================

export { usePermissions as useBOSPermissions, useModules, useFeature, usePolicy } from './useAuthorization';
