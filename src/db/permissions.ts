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
    const permissions = RolePermissions[userRole] || [];
    
    return permissions.includes(permission);
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
