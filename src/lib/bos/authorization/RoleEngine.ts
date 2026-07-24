import { db } from '../../../db/index.ts';
import { roles, rolePermissions, tenants, workspaces, workspaceMembers, permissionAuditLog } from '../../../db/schema.ts';
import { getRolePermissions as getLegacyRolePermissions, isWorkspaceRole, WorkspaceRole } from '../../../db/permissions.ts';
import { and, eq, sql, desc, asc, or } from 'drizzle-orm';
import { authorizationEngine } from './AuthorizationEngine';

// ============================================================================
// TYPES
// ============================================================================

export type RoleSlug = string;
export type PermissionSlug = string;

export interface CreateRoleInput {
  slug: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isSystem?: boolean;
  parentRoleSlug?: string;
  priority?: number;
  tenantId: string;
  workspaceId?: number;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  parentRoleSlug?: string | null;
  priority?: number;
  workspaceId?: number;
}

export interface RoleWithPermissions {
  id: number;
  slug: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isSystem: boolean;
  isActive: boolean;
  parentRoleSlug?: string;
  priority: number;
  tenantId: string;
  workspaceId?: number;
  permissions: PermissionSlug[];
  inheritedPermissions: PermissionSlug[];
}

// ============================================================================
// ROLE ENGINE - Hierarchical role management with inheritance
// ============================================================================

export class RoleEngine {
  // -------------------------------------------------------------------------
  // ROLE CRUD
  // -------------------------------------------------------------------------

  async createRole(input: CreateRoleInput, actorUid: string, ipAddress?: string) {
    const [role] = await db.insert(roles).values({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      color: input.color || '#64748B',
      icon: input.icon || 'user',
      isSystem: input.isSystem || false,
      parentRoleSlug: input.parentRoleSlug || null,
      priority: input.priority || 0,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId || null,
    }).returning();

    await this.logPermissionChange(actorUid, 'role_created', 'role', String(role.id), null, role, ipAddress, input.tenantId, input.workspaceId);

    // Invalidate caches
    authorizationEngine.invalidateAll();

    return role;
  }

  async updateRole(
    slug: string,
    tenantId: string,
    input: UpdateRoleInput,
    actorUid: string,
    ipAddress?: string
  ) {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.slug, slug), eq(roles.tenantId, tenantId)))
      .limit(1);

    if (!role) throw new Error('Role not found');
    if (role.isSystem) throw new Error('Cannot modify system role');

    const [updated] = await db
      .update(roles)
      .set({
        ...input,
        parentRoleSlug: input.parentRoleSlug === null ? null : input.parentRoleSlug,
        updatedAt: new Date(),
      })
      .where(and(eq(roles.slug, slug), eq(roles.tenantId, tenantId)))
      .returning();

    await this.logPermissionChange(actorUid, 'role_updated', 'role', slug, role, updated, ipAddress, tenantId, input.workspaceId);

    // Invalidate caches
    authorizationEngine.invalidateAll();

    return updated;
  }

  async deleteRole(slug: string, tenantId: string, actorUid: string, ipAddress?: string) {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.slug, slug), eq(roles.tenantId, tenantId)))
      .limit(1);

    if (!role) throw new Error('Role not found');
    if (role.isSystem) throw new Error('Cannot delete system role');

    // Check if any workspace members use this role
    const membersUsingRole = await db
      .select({ count: sql<number>`count(*)` })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.role, slug),
          eq(workspaceMembers.tenantId, tenantId)
        )
      );

    if (membersUsingRole[0]?.count > 0) {
      throw new Error(`Cannot delete role: ${membersUsingRole[0].count} members are using it`);
    }

    await db.delete(roles).where(and(eq(roles.slug, slug), eq(roles.tenantId, tenantId)));

    await this.logPermissionChange(actorUid, 'role_deleted', 'role', slug, role, null, ipAddress, tenantId);

    // Invalidate caches
    authorizationEngine.invalidateAll();

    return { success: true };
  }

  async getRole(slug: string, tenantId: string) {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.slug, slug), eq(roles.tenantId, tenantId)))
      .limit(1);

    if (!role) return null;

    const permissions = await this.getRolePermissions(slug, tenantId, false);
    const inheritedPermissions = await this.getRolePermissions(slug, tenantId, true);

    return {
      ...role,
      permissions,
      inheritedPermissions,
    };
  }

  async getAllRoles(tenantId: string, workspaceId?: number) {
    const conditions = [eq(roles.tenantId, tenantId)];
    if (workspaceId) {
      conditions.push(
        or(eq(roles.workspaceId, workspaceId), eq(roles.workspaceId, null))
      );
    }

    const allRoles = await db.select().from(roles).where(and(...conditions));

    const rolesWithPerms = await Promise.all(
      allRoles.map(async (role) => {
        const permissions = await this.getRolePermissions(role.slug, tenantId, false);
        const inheritedPermissions = await this.getRolePermissions(role.slug, tenantId, true);
        return {
          ...role,
          permissions,
          inheritedPermissions,
        };
      })
    );

    return rolesWithPerms;
  }

  // -------------------------------------------------------------------------
  // PERMISSION ASSIGNMENT
  // -------------------------------------------------------------------------

  async assignPermissionToRole(
    roleSlug: string,
    permissionSlug: string,
    tenantId: string,
    actorUid: string,
    ipAddress?: string,
    inherited: boolean = false
  ) {
    const [existing] = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleSlug, roleSlug),
          eq(rolePermissions.permissionSlug, permissionSlug),
          eq(rolePermissions.tenantId, tenantId)
        )
      )
      .limit(1);

    if (existing) return existing;

    const [rp] = await db.insert(rolePermissions).values({
      roleSlug,
      permissionSlug,
      tenantId,
      isInherited: inherited,
    }).returning();

    await this.logPermissionChange(actorUid, 'permission_granted', 'role_permission', `${roleSlug}:${permissionSlug}`, null, rp, ipAddress, tenantId);

    authorizationEngine.invalidateAll();

    return rp;
  }

  async revokePermissionFromRole(
    roleSlug: string,
    permissionSlug: string,
    tenantId: string,
    actorUid: string,
    ipAddress?: string
  ) {
    const [existing] = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleSlug, roleSlug),
          eq(rolePermissions.permissionSlug, permissionSlug),
          eq(rolePermissions.tenantId, tenantId),
          eq(rolePermissions.isInherited, false)
        )
      )
      .limit(1);

    if (!existing) return null;

    await db.delete(rolePermissions).where(
      and(
        eq(rolePermissions.roleSlug, roleSlug),
        eq(rolePermissions.permissionSlug, permissionSlug),
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.isInherited, false)
      )
    );

    await this.logPermissionChange(actorUid, 'permission_revoked', 'role_permission', `${roleSlug}:${permissionSlug}`, existing, null, ipAddress, tenantId);

    authorizationEngine.invalidateAll();

    return { success: true };
  }

  async getRolePermissions(
    roleSlug: string,
    tenantId: string,
    inherited: boolean = false
  ): Promise<PermissionSlug[]> {
    try {
      const perms = await db
        .select({ permissionSlug: rolePermissions.permissionSlug })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleSlug, roleSlug),
            eq(rolePermissions.tenantId, tenantId),
            eq(rolePermissions.isInherited, inherited)
          )
        );

      return perms.map((p) => p.permissionSlug);
    } catch (error: any) {
      const message = String(error?.message || error);
      if (error?.code === '42P01' || /relation "role_permissions" does not exist/i.test(message)) {
        console.warn('[RoleEngine] role_permissions table missing, falling back to legacy role permissions');
        return isWorkspaceRole(roleSlug)
          ? getLegacyRolePermissions(roleSlug as WorkspaceRole)
          : [];
      }
      throw error;
    }
  }

  async getRoleHierarchy(tenantId: string): Promise<Map<string, string[]>> {
    const allRoles = await db
      .select({ slug: roles.slug, parentRoleSlug: roles.parentRoleSlug })
      .from(roles)
      .where(eq(roles.tenantId, tenantId));

    const hierarchy = new Map<string, string[]>();

    for (const role of allRoles) {
      if (role.parentRoleSlug) {
        const children = hierarchy.get(role.parentRoleSlug) || [];
        children.push(role.slug);
        hierarchy.set(role.parentRoleSlug, children);
      }
    }

    return hierarchy;
  }

  // -------------------------------------------------------------------------
  // SYSTEM ROLES SEEDER
  // -------------------------------------------------------------------------

  async seedSystemRoles(tenantId: string) {
    const systemRoles = [
      { slug: 'owner', name: 'Proprietário', description: 'Acesso total à workspace', color: '#DC2626', icon: 'crown', priority: 100 },
      { slug: 'admin', name: 'Administrador', description: 'Gerenciamento completo exceto exclusão da workspace', color: '#EA580C', icon: 'shield', priority: 90 },
      { slug: 'manager', name: 'Gerente', description: 'Gestão de projetos e equipes', color: '#2563EB', icon: 'users', priority: 70 },
      { slug: 'supervisor', name: 'Supervisor', description: 'Supervisão de equipes e aprovações', color: '#7C3AED', icon: 'eye', priority: 50 },
      { slug: 'member', name: 'Membro', description: 'Membro padrão da workspace', color: '#64748B', icon: 'user', priority: 20 },
      { slug: 'viewer', name: 'Visualizador', description: 'Acesso somente leitura', color: '#94A3B8', icon: 'eye-off', priority: 10 },
    ];

    const created: any[] = [];

    for (const roleData of systemRoles) {
      const [existing] = await db
        .select()
        .from(roles)
        .where(
          and(
            eq(roles.slug, roleData.slug),
            eq(roles.tenantId, tenantId)
          )
        )
        .limit(1);

      if (!existing) {
        const [role] = await db.insert(roles).values({
          ...roleData,
          isSystem: true,
          parentRoleSlug: roleData.slug === 'owner' ? null :
            roleData.slug === 'admin' ? 'owner' :
            roleData.slug === 'manager' ? 'admin' :
            roleData.slug === 'supervisor' ? 'manager' :
            roleData.slug === 'member' ? 'supervisor' : 'member',
          tenantId,
        }).returning();

        created.push(role);
      }
    }

    return created;
  }

  // -------------------------------------------------------------------------
  // AUDIT LOGGING
  // -------------------------------------------------------------------------

  private async logPermissionChange(
    actorUid: string,
    action: string,
    targetType: string,
    targetId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    tenantId?: string,
    workspaceId?: number
  ) {
    try {
      await db.insert(permissionAuditLog).values({
        tenantId: tenantId || '',
        workspaceId: workspaceId || null,
        actorUid,
        action,
        targetType,
        targetId,
        oldValue: oldValue ? { ...oldValue } : null,
        newValue: newValue ? { ...newValue } : null,
        ipAddress: ipAddress || null,
        userAgent: null,
      });
    } catch (error) {
      console.error('[RoleEngine] Error logging permission change:', error);
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const roleEngine = new RoleEngine();
