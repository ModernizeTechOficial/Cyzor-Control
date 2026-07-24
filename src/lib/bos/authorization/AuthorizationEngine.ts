import { db } from '../../../db/index.ts';
import { roles, permissions, rolePermissions, workspaceMembers, users, tenants, featureFlags, assignments } from '../../../db/schema.ts';
import { getRolePermissions as getLegacyRolePermissions, isWorkspaceRole, WorkspaceRole } from '../../../db/permissions.ts';
import { and, eq, sql, desc, asc } from 'drizzle-orm';
import { LRUCache } from 'lru-cache';

// ============================================================================
// TYPES
// ============================================================================

export type PermissionSlug = string;
export type RoleSlug = string;
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

export interface EffectivePermissions {
  rolePermissions: Set<PermissionSlug>;
  explicitPermissions: Set<PermissionSlug>;
  assignmentPermissions: Set<PermissionSlug>;
  combined: Set<PermissionSlug>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  permissions: Set<PermissionSlug>;
}

export interface RoleRecord {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionRecord {
  id: number;
  slug: string;
  module: string;
  resource: string;
  action: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface ModuleRecord {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  version: string;
  status: string;
  isSystem: boolean;
  dependencies: string[];
  manifest: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AUTHORIZATION ENGINE - Central motor for all access control
// ============================================================================

export class AuthorizationEngine {
  private permissionCache: LRUCache<string, { data: Set<PermissionSlug>; expires: number }>;
  private roleCache: LRUCache<string, RoleRecord | null>;
  private moduleCache: LRUCache<string, ModuleRecord[]>;
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private readonly CACHE_MAX = 10000;

  constructor() {
    this.permissionCache = new LRUCache({
      max: this.CACHE_MAX,
      ttl: this.CACHE_TTL,
    });
    this.roleCache = new LRUCache({ max: 1000, ttl: 30 * 60 * 1000 });
    this.moduleCache = new LRUCache({ max: 1000, ttl: 30 * 60 * 1000 });
  }

  // -------------------------------------------------------------------------
  // CORE AUTHORIZATION
  // -------------------------------------------------------------------------

  async can(
    context: AuthorizationContext,
    permission: PermissionSlug,
    resourceType?: string,
    resourceId?: number
  ): Promise<AuthorizationResult> {
    try {
      const effectivePerms = await this.getEffectivePermissions(context);

      if (effectivePerms.combined.has(permission)) {
        return { allowed: true, permissions: effectivePerms.combined };
      }

      // Check resource-scoped assignments
      if (resourceType && resourceId) {
        const assignmentAllowed = await this.checkAssignmentPermission(
          context,
          permission,
          resourceType,
          resourceId
        );
        if (assignmentAllowed) {
          const updated = new Set(effectivePerms.combined);
          updated.add(permission);
          return { allowed: true, reason: 'assignment', permissions: updated };
        }
      }

      return {
        allowed: false,
        reason: `Missing permission: ${permission}`,
        permissions: effectivePerms.combined,
      };
    } catch (error) {
      console.error('[AuthorizationEngine] Error in can():', error);
      return {
        allowed: false,
        reason: 'Authorization check failed',
        permissions: new Set(),
      };
    }
  }

  async cannot(
    context: AuthorizationContext,
    permission: PermissionSlug,
    resourceType?: string,
    resourceId?: number
  ): Promise<AuthorizationResult> {
    const result = await this.can(context, permission, resourceType, resourceId);
    return {
      allowed: !result.allowed,
      reason: result.reason,
      permissions: result.permissions,
    };
  }

  // -------------------------------------------------------------------------
  // ROLE CHECKS
  // -------------------------------------------------------------------------

  async hasRole(
    context: AuthorizationContext,
    role: RoleSlug
  ): Promise<boolean> {
    try {
      const [member] = await db
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userUid, context.userId),
            eq(workspaceMembers.workspaceId, context.workspaceId)
          )
        )
        .limit(1);

      if (!member) return false;

      if (member.role === role) return true;

      const roleRecord = await db
        .select({ parentRoleSlug: roles.parentRoleSlug })
        .from(roles)
        .where(eq(roles.slug, member.role))
        .limit(1);

      if (roleRecord.length > 0 && roleRecord[0].parentRoleSlug === role) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthorizationEngine] Error in hasRole():', error);
      return false;
    }
  }

  async hasPermission(
    context: AuthorizationContext,
    permission: PermissionSlug
  ): Promise<boolean> {
    const result = await this.can(context, permission);
    return result.allowed;
  }

  // -------------------------------------------------------------------------
  // FEATURE FLAGS
  // -------------------------------------------------------------------------

  async hasFeature(
    context: AuthorizationContext,
    featureKey: string
  ): Promise<boolean> {
    try {
      const [wsFlag] = await db
        .select()
        .from(featureFlags)
        .where(
          and(
            eq(featureFlags.key, featureKey),
            eq(featureFlags.workspaceId, context.workspaceId),
            eq(featureFlags.scope, 'workspace')
          )
        )
        .limit(1);

      if (wsFlag) return wsFlag.isEnabled;

      const [tenantFlag] = await db
        .select()
        .from(featureFlags)
        .where(
          and(
            eq(featureFlags.key, featureKey),
            eq(featureFlags.tenantId, context.tenantId),
            eq(featureFlags.scope, 'tenant')
          )
        )
        .limit(1);

      if (tenantFlag) return tenantFlag.isEnabled;

      return false;
    } catch (error) {
      console.error('[AuthorizationEngine] Error in hasFeature():', error);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // EFFECTIVE PERMISSIONS
  // -------------------------------------------------------------------------

  async getEffectivePermissions(
    context: AuthorizationContext
  ): Promise<EffectivePermissions> {
    const cacheKey = `${context.userId}:${context.workspaceId}`;

    const cached = this.permissionCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return this.buildEffectivePermissionsResponse(cached.data);
    }

    let effective: EffectivePermissions;
    try {
      effective = await this.computeEffectivePermissions(context);
    } catch (error) {
      console.warn('[AuthorizationEngine] BOS tables unavailable, falling back to legacy permissions:', error);
      effective = await this.computeLegacyEffectivePermissions(context);
    }

    this.permissionCache.set(cacheKey, {
      data: effective.combined,
      expires: Date.now() + this.CACHE_TTL,
    });

    return effective;
  }

  // -------------------------------------------------------------------------
  // MODULE ACCESS
  // -------------------------------------------------------------------------

  async getAccessibleModules(context: AuthorizationContext): Promise<ModuleSlug[]> {
    const cacheKey = `modules:${context.userId}:${context.workspaceId}`;

    const cached = this.moduleCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const effectivePerms = await this.getEffectivePermissions(context);
      const allModules = await db
        .select()
        .from(modules)
        .where(eq(modules.isActive, true));

      const accessible: ModuleSlug[] = [];

      for (const module of allModules) {
        const moduleSlug = module.slug as ModuleSlug;

        const hasModuleAccess = Array.from(effectivePerms.combined).some(
          (perm) => perm.startsWith(`${moduleSlug}.`) || perm === `modules.${moduleSlug}.access`
        );

        const featureEnabled = await this.hasFeature(context, `${moduleSlug}_module_enabled`);

        if (hasModuleAccess || featureEnabled) {
          accessible.push(moduleSlug);
        }
      }

      this.moduleCache.set(cacheKey, {
        data: accessible,
        expires: Date.now() + this.CACHE_TTL,
      });

      return accessible;
    } catch (error) {
      console.error('[AuthorizationEngine] Error in getAccessibleModules():', error);
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // CACHE MANAGEMENT
  // -------------------------------------------------------------------------

  invalidateCache(userId: string, workspaceId: number): void {
    const cacheKey = `${userId}:${workspaceId}`;
    this.permissionCache.delete(cacheKey);
    this.moduleCache.delete(`modules:${userId}:${workspaceId}`);
  }

  invalidateAll(): void {
    this.permissionCache.clear();
    this.roleCache.clear();
    this.moduleCache.clear();
  }

  // -------------------------------------------------------------------------
  // INTERNAL HELPERS
  // -------------------------------------------------------------------------

  private async computeEffectivePermissions(
    context: AuthorizationContext
  ): Promise<EffectivePermissions> {
    const rolePermissions = new Set<PermissionSlug>();
    const explicitPermissions = new Set<PermissionSlug>();
    const assignmentPermissions = new Set<PermissionSlug>();

    // 1. Get member record
    const [member] = await db
      .select({
        role: workspaceMembers.role,
        permissions: workspaceMembers.permissions,
        status: workspaceMembers.status,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userUid, context.userId),
          eq(workspaceMembers.workspaceId, context.workspaceId)
        )
      )
      .limit(1);

    // 2. Determine role with fallbacks
    let memberRole: string | null = null;

    if (member && member.status === 'Ativo') {
      memberRole = member.role;
    } else {
      // Check workspace owner
      const { workspaces } = await import('../../../db/schema.ts');
      const [workspace] = await db
        .select({ ownerUid: workspaces.ownerUid })
        .from(workspaces)
        .where(eq(workspaces.id, context.workspaceId))
        .limit(1);

      if (workspace?.ownerUid === context.userId) {
        memberRole = 'OWNER';
      }
    }

    if (!memberRole) {
      return this.buildEmptyEffectivePermissions();
    }

    // 3. Resolve role hierarchy and permissions
    const rolePerms = await this.resolveRolePermissions(memberRole, context.tenantId);
    rolePerms.forEach((p) => rolePermissions.add(p));

    // 4. Add explicit permissions from workspace_members.permissions (jsonb)
    if (member && Array.isArray(member.permissions)) {
      member.permissions.forEach((p: any) => {
        if (typeof p === 'string') explicitPermissions.add(p);
      });
    }

    // 5. Get resource-scoped assignment permissions from assignments table
    const resourceAssignPerms = await this.getAssignmentPermissions(context);
    resourceAssignPerms.forEach((p) => assignmentPermissions.add(p));

    const combined = new Set<PermissionSlug>([
      ...rolePermissions,
      ...explicitPermissions,
      ...assignmentPermissions,
    ]);

    return { rolePermissions, explicitPermissions, assignmentPermissions, combined };
  }

  private async resolveRolePermissions(
    roleSlug: string,
    tenantId: string
  ): Promise<PermissionSlug[]> {
    const perms = new Set<PermissionSlug>();

    // Get direct role permissions from new system
    try {
      const directPerms = await db
        .select({ permissionSlug: rolePermissions.permissionSlug })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleSlug, roleSlug),
            eq(rolePermissions.tenantId, tenantId),
            eq(rolePermissions.isInherited, false)
          )
        );

      directPerms.forEach((p) => perms.add(p.permissionSlug));
    } catch (error: any) {
      const message = String(error?.message || error);
      if (error?.code === '42P01' || /relation "role_permissions" does not exist/i.test(message)) {
        console.warn('[AuthorizationEngine] role_permissions table missing, falling back to legacy role permissions');
        if (isWorkspaceRole(roleSlug)) {
          getLegacyRolePermissions(roleSlug as WorkspaceRole).forEach((permission) => perms.add(permission));
        }
      } else {
        throw error;
      }
    }

    try {
      const [role] = await db
        .select({ parentRoleSlug: roles.parentRoleSlug })
        .from(roles)
        .where(eq(roles.slug, roleSlug))
        .limit(1);

      if (role?.parentRoleSlug) {
        const parentPerms = await this.resolveRolePermissions(role.parentRoleSlug, tenantId);
        parentPerms.forEach((p) => perms.add(p));
      }
    } catch (error: any) {
      const message = String(error?.message || error);
      if (error?.code === '42P01' || /relation "roles" does not exist/i.test(message)) {
        console.warn('[AuthorizationEngine] roles table missing, skipping role inheritance fallback');
      } else {
        throw error;
      }
    }

    return Array.from(perms);
  }

  private async getAssignmentPermissions(
    context: AuthorizationContext
  ): Promise<PermissionSlug[]> {
    try {
      const [member] = await db
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userUid, context.userId),
            eq(workspaceMembers.workspaceId, context.workspaceId)
          )
        )
        .limit(1);

      if (!member) return [];

      // Get resource-scoped assignments from assignments table
      const memberAssignments = await db
        .select({ permissionSet: assignments.permissionSet })
        .from(assignments)
        .where(
          and(
            eq(assignments.workspaceId, context.workspaceId),
            eq(assignments.memberId, member.id),
            eq(assignments.status, 'ACTIVE')
          )
        );

      const perms: PermissionSlug[] = [];
      memberAssignments.forEach((a) => {
        if (Array.isArray(a.permissionSet)) {
          a.permissionSet.forEach((p: any) => {
            if (typeof p === 'string') perms.push(p);
          });
        }
      });

      return perms;
    } catch (error) {
      console.error('[AuthorizationEngine] Error in getAssignmentPermissions():', error);
      return [];
    }
  }

  private async checkAssignmentPermission(
    context: AuthorizationContext,
    permission: PermissionSlug,
    resourceType: string,
    resourceId: number
  ): Promise<boolean> {
    try {
      const [member] = await db
        .select({ id: workspaceMembers.id })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userUid, context.userId),
            eq(workspaceMembers.workspaceId, context.workspaceId)
          )
        )
        .limit(1);

      if (!member) return false;

      // Check direct resource assignment
      const [assignment] = await db
        .select({ permissionSet: assignments.permissionSet })
        .from(assignments)
        .where(
          and(
            eq(assignments.workspaceId, context.workspaceId),
            eq(assignments.resourceType, resourceType),
            eq(assignments.resourceId, resourceId),
            eq(assignments.memberId, member.id),
            eq(assignments.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (assignment?.permissionSet) {
        return Array.isArray(assignment.permissionSet) &&
          assignment.permissionSet.includes(permission);
      }

      // Check Organization visibility scope for view permissions
      if (permission.startsWith('view') || permission.startsWith('read')) {
        const orgAssignment = await db
          .select()
          .from(assignments)
          .where(
            and(
              eq(assignments.workspaceId, context.workspaceId),
              eq(assignments.resourceType, resourceType),
              eq(assignments.resourceId, resourceId),
              eq(assignments.visibilityScope, 'Organization'),
              eq(assignments.status, 'ACTIVE')
            )
          )
          .limit(1);

        if (orgAssignment.length > 0) return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthorizationEngine] Error in checkAssignmentPermission():', error);
      return false;
    }
  }

  private buildEffectivePermissionsResponse(
    combined: Set<PermissionSlug>
  ): EffectivePermissions {
    return {
      rolePermissions: new Set(),
      explicitPermissions: new Set(),
      assignmentPermissions: new Set(),
      combined,
    };
  }

  private buildEmptyEffectivePermissions(): EffectivePermissions {
    return {
      rolePermissions: new Set(),
      explicitPermissions: new Set(),
      assignmentPermissions: new Set(),
      combined: new Set(),
    };
  }

  private async computeLegacyEffectivePermissions(
    context: AuthorizationContext
  ): Promise<EffectivePermissions> {
    const rolePermissions = new Set<PermissionSlug>();
    const explicitPermissions = new Set<PermissionSlug>();
    const assignmentPermissions = new Set<PermissionSlug>();

    try {
      const [member] = await db
        .select({
          role: workspaceMembers.role,
          permissions: workspaceMembers.permissions,
          status: workspaceMembers.status,
        })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userUid, context.userId),
            eq(workspaceMembers.workspaceId, context.workspaceId)
          )
        )
        .limit(1);

      let memberRole: string | null = null;

      if (member && member.status === 'Ativo') {
        memberRole = member.role;
      } else {
        const { workspaces } = await import('../../../db/schema.ts');
        const [workspace] = await db
          .select({ ownerUid: workspaces.ownerUid })
          .from(workspaces)
          .where(eq(workspaces.id, context.workspaceId))
          .limit(1);

        if (workspace?.ownerUid === context.userId) {
          memberRole = 'OWNER';
        }
      }

      if (!memberRole) {
        return this.buildEmptyEffectivePermissions();
      }

      if (memberRole === 'OWNER') {
        const allLegacy = getLegacyRolePermissions(WorkspaceRole.OWNER);
        allLegacy.forEach((p) => rolePermissions.add(p));
      } else if (isWorkspaceRole(memberRole)) {
        const rolePerms = getLegacyRolePermissions(memberRole as WorkspaceRole);
        rolePerms.forEach((p) => rolePermissions.add(p));
      }

      if (member && Array.isArray(member.permissions)) {
        member.permissions.forEach((p: any) => {
          if (typeof p === 'string') explicitPermissions.add(p);
        });
      }
    } catch (error) {
      console.error('[AuthorizationEngine] Legacy fallback failed:', error);
    }

    const combined = new Set<PermissionSlug>([
      ...rolePermissions,
      ...explicitPermissions,
      ...assignmentPermissions,
    ]);

    return { rolePermissions, explicitPermissions, assignmentPermissions, combined };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const authorizationEngine = new AuthorizationEngine();
