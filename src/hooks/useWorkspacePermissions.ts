import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMembers } from './useCyzorQueries';

export type Permission =
  | 'manage_members'
  | 'create_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'view_finance'
  | 'manage_finance'
  | 'manage_ai'
  | 'manage_integrations'
  | 'manage_settings'
  | 'create_products'
  | 'publish_products';

const rolePermissionsMap: Record<string, Permission[]> = {
  OWNER: ['manage_members', 'create_projects', 'edit_projects', 'delete_projects', 'view_finance', 'manage_finance', 'manage_ai', 'manage_integrations', 'manage_settings', 'create_products', 'publish_products'],
  ADMIN: ['manage_members', 'create_projects', 'edit_projects', 'delete_projects', 'view_finance', 'manage_finance', 'manage_ai', 'manage_integrations', 'manage_settings', 'create_products', 'publish_products'],
  MANAGER: ['create_projects', 'edit_projects', 'view_finance', 'create_products'],
  DEVELOPER: ['edit_projects', 'publish_products'],
  DESIGNER: ['edit_projects'],
  FINANCE: ['view_finance', 'manage_finance'],
  VIEWER: [],
  MEMBER: ['edit_projects']
};

export const normalizePermissions = (permissions: any): Permission[] => {
  if (!Array.isArray(permissions)) return [];
  return Array.from(
    new Set(
      permissions
        .map((perm) => String(perm).trim())
        .filter((perm) => Object.values(rolePermissionsMap).flat().includes(perm as Permission))
    )
  ) as Permission[];
};

export const getEffectivePermissions = (role: string, permissions: any): Set<Permission> => {
  const normalized = normalizePermissions(permissions);
  const rolePerms = rolePermissionsMap[role as keyof typeof rolePermissionsMap] || [];
  if (role === 'OWNER') {
    return new Set<Permission>([...Object.values(rolePermissionsMap).flat(), ...normalized]);
  }
  return new Set<Permission>([...rolePerms, ...normalized]);
};

export const useWorkspacePermissions = () => {
  const { user, dbUser, activeWorkspace } = useAuth();
  const { data: members = [], isLoading: isMembersLoading } = useMembers();

  const currentMember = useMemo(() => {
    if (!user || !Array.isArray(members)) return null;
    const found = members.find((member: any) => member.uid === user.uid) || null;
    if (found) return found;
    // Fallback: if the active workspace owner matches current user, treat as OWNER
    if (activeWorkspace?.ownerUid === user.uid) {
      return { uid: user.uid, role: 'OWNER', permissions: [] } as any;
    }
    // Fallback: if dbUser role is OWNER, expose as OWNER even if member record not loaded
    if (dbUser?.role && String(dbUser.role).toUpperCase().includes('OWNER')) {
      return { uid: user.uid, role: 'OWNER', permissions: [] } as any;
    }
    return null;
  }, [members, user, activeWorkspace, dbUser]);

  const currentPermissions = useMemo(() => {
    if (!currentMember) return new Set<Permission>();
    return getEffectivePermissions(currentMember.role || 'MEMBER', currentMember.permissions || []);
  }, [currentMember]);

  return {
    currentMember,
    currentPermissions,
    canViewFinance: currentPermissions.has('view_finance'),
    canManageFinance: currentPermissions.has('manage_finance'),
    canManageMembers: currentPermissions.has('manage_members'),
    canManageSettings: currentPermissions.has('manage_settings'),
    isLoading: isMembersLoading,
    isOwner: currentMember?.role?.toString().toUpperCase().includes('OWNER') || false
  };
};
