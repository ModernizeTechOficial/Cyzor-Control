import { db } from "./index.ts";
import { workspaceMembers } from "./schema.ts";
import { and, eq } from "drizzle-orm";

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  FINANCE = 'FINANCE',
  VIEWER = 'VIEWER',
  MEMBER = 'MEMBER'
}

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

const RolePermissions: Record<WorkspaceRole, Permission[]> = {
  [WorkspaceRole.OWNER]: [
    'manage_members', 'create_projects', 'edit_projects', 'delete_projects', 
    'view_finance', 'manage_finance', 'manage_ai', 'manage_integrations', 
    'manage_settings', 'create_products', 'publish_products'
  ],
  [WorkspaceRole.ADMIN]: [
    'manage_members', 'create_projects', 'edit_projects', 'delete_projects', 
    'view_finance', 'manage_finance', 'manage_ai', 'manage_integrations', 
    'manage_settings', 'create_products', 'publish_products'
  ],
  [WorkspaceRole.MANAGER]: [
    'create_projects', 'edit_projects', 'view_finance', 'create_products'
  ],
  [WorkspaceRole.DEVELOPER]: [
    'edit_projects', 'publish_products'
  ],
  [WorkspaceRole.DESIGNER]: [
    'edit_projects'
  ],
  [WorkspaceRole.FINANCE]: [
    'view_finance', 'manage_finance'
  ],
  [WorkspaceRole.VIEWER]: [],
  [WorkspaceRole.MEMBER]: [
    'edit_projects'
  ]
};

const allPermissions: Permission[] = Array.from(new Set(Object.values(RolePermissions).flat()));

export function isWorkspaceRole(value: string | undefined): value is WorkspaceRole {
  if (!value) return false;
  return Object.values(WorkspaceRole).includes(value as WorkspaceRole);
}

export function getRolePermissions(role: WorkspaceRole): Permission[] {
  return RolePermissions[role] || [];
}

export function normalizePermissions(permissions: any): Permission[] {
  if (!Array.isArray(permissions)) return [];
  return Array.from(new Set(permissions
    .map((perm) => String(perm).trim())
    .filter((perm): perm is Permission => allPermissions.includes(perm as Permission))));
}

export function sanitizePermissionsForRole(role: WorkspaceRole, permissions: any): Permission[] {
  const normalized = normalizePermissions(permissions);
  const allowed = getRolePermissions(role);
  return normalized.filter((perm) => allowed.includes(perm));
}

export function validateRolePermissionAssignment(role: WorkspaceRole, permissions: any): { valid: boolean; invalidPermissions: Permission[] } {
  const normalized = normalizePermissions(permissions);
  const allowed = getRolePermissions(role);
  return {
    valid: normalized.every((perm) => allowed.includes(perm)),
    invalidPermissions: normalized.filter((perm) => !allowed.includes(perm))
  };
}

export async function hasPermission(userUid: string, workspaceId: number, permission: Permission): Promise<boolean> {
  try {
    const [member] = await db.select()
      .from(workspaceMembers)
      .where(and(
        eq(workspaceMembers.userUid, userUid),
        eq(workspaceMembers.workspaceId, workspaceId)
      ))
      .limit(1);

    if (!member) return false;

    const userRole = member.role as WorkspaceRole;
    const rolePermissions = getRolePermissions(userRole);
    const explicitPermissions = Array.isArray(member.permissions) ? normalizePermissions(member.permissions) : [];
    
    const combinedPermissions = Array.from(new Set([...rolePermissions, ...explicitPermissions]));
    return combinedPermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

export async function getMemberRole(userUid: string, workspaceId: number): Promise<WorkspaceRole | null> {
  const [member] = await db.select()
    .from(workspaceMembers)
    .where(and(
      eq(workspaceMembers.userUid, userUid),
      eq(workspaceMembers.workspaceId, workspaceId)
    ))
    .limit(1);
  
  return member ? (member.role as WorkspaceRole) : null;
}
