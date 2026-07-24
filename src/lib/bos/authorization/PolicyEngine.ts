import { db } from '../../db/index.ts';
import { tenants, users, workspaces, workspaceMembers, featureFlags, assignments } from '../../db/schema.ts';
import { and, eq, sql } from 'drizzle-orm';
import { authorizationEngine } from './AuthorizationEngine';

// ============================================================================
// TYPES
// ============================================================================

export type ModuleSlug = string;
export type ResourceSlug = string;
export type ActionSlug = string;
export type PermissionSlug = string;

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

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
  conditions?: Record<string, any>;
}

export interface ResourcePolicy {
  resource: ResourceSlug;
  actions: ActionSlug[];
  conditions?: Record<string, any>;
}

// ============================================================================
// POLICY ENGINE - Resource-specific authorization policies
// ============================================================================

export class PolicyEngine {
  private policies: Map<string, ResourcePolicy> = new Map();

  constructor() {
    this.registerDefaultPolicies();
  }

  // -------------------------------------------------------------------------
  // POLICY REGISTRATION
  // -------------------------------------------------------------------------

  registerPolicy(policy: ResourcePolicy): void {
    this.policies.set(policy.resource, policy);
  }

  unregisterPolicy(resource: ResourceSlug): void {
    this.policies.delete(resource);
  }

  getPolicy(resource: ResourceSlug): ResourcePolicy | undefined {
    return this.policies.get(resource);
  }

  getAllPolicies(): ResourcePolicy[] {
    return Array.from(this.policies.values());
  }

  // -------------------------------------------------------------------------
  // AUTHORIZATION
  // -------------------------------------------------------------------------

  async can(
    context: AuthorizationContext,
    resource: ResourceSlug,
    action: ActionSlug
  ): Promise<PolicyResult> {
    // Check policy
    const policy = this.policies.get(resource);
    if (policy) {
      if (!policy.actions.includes(action)) {
        return {
          allowed: false,
          reason: `Action ${action} not allowed on resource ${resource}`,
          conditions: policy.conditions,
        };
      }
    }

    // Convert to permission slug and check via AuthorizationEngine
    const permission = `${resource}.${action}`;
    const result = await authorizationEngine.can(context, permission);

    return {
      allowed: result.allowed,
      reason: result.reason,
      conditions: policy?.conditions,
    };
  }

  async cannot(
    context: AuthorizationContext,
    resource: ResourceSlug,
    action: ActionSlug
  ): Promise<PolicyResult> {
    const result = await this.can(context, resource, action);
    return {
      allowed: !result.allowed,
      reason: result.reason,
      conditions: result.conditions,
    };
  }

  // -------------------------------------------------------------------------
  // BATCH CHECKS
  // -------------------------------------------------------------------------

  async canAny(
    context: AuthorizationContext,
    checks: Array<{ resource: ResourceSlug; action: ActionSlug }>
  ): Promise<boolean> {
    for (const check of checks) {
      const result = await this.can(context, check.resource, check.action);
      if (result.allowed) return true;
    }
    return false;
  }

  async canAll(
    context: AuthorizationContext,
    checks: Array<{ resource: ResourceSlug; action: ActionSlug }>
  ): Promise<boolean> {
    for (const check of checks) {
      const result = await this.can(context, check.resource, check.action);
      if (!result.allowed) return false;
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // DEFAULT POLICIES
  // -------------------------------------------------------------------------

  private registerDefaultPolicies(): void {
    // Finance policies
    this.registerPolicy({
      resource: 'finance.entries',
      actions: ['view', 'create', 'edit', 'delete', 'export', 'import', 'approve'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'finance.categories',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
      conditions: { requireActiveTenant: true },
    });

    // CRM policies
    this.registerPolicy({
      resource: 'crm.clients',
      actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'crm.contacts',
      actions: ['view', 'create', 'edit', 'delete'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'crm.leads',
      actions: ['view', 'create', 'edit', 'delete', 'convert'],
      conditions: { requireActiveTenant: true },
    });

    // Projects policies
    this.registerPolicy({
      resource: 'projects.projects',
      actions: ['view', 'create', 'edit', 'delete', 'archive', 'export'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'projects.tasks',
      actions: ['view', 'create', 'edit', 'delete', 'assign', 'comment', 'export'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'projects.sprints',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
      conditions: { requireActiveTenant: true },
    });

    // Core policies
    this.registerPolicy({
      resource: 'workspaces.workspaces',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'auth.users',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
      conditions: { requireActiveTenant: true },
    });

    this.registerPolicy({
      resource: 'auth.members',
      actions: ['view', 'invite', 'edit', 'remove', 'manage'],
      conditions: { requireActiveTenant: true },
    });
  }

  // -------------------------------------------------------------------------
  // CONTEXT BUILDER
  // -------------------------------------------------------------------------

  static async buildContext(req: any): Promise<AuthorizationContext> {
    const userId = req.user?.uid;
    if (!userId) throw new Error('Unauthorized: Missing user');

    const workspaceId = req.workspaceId;
    if (!workspaceId) throw new Error('Unauthorized: Missing workspace');

    let tenantId = req.tenantId;
    if (!tenantId) {
      const [ws] = await db.select({ tenantId: workspaces.tenantId }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
      if (ws) tenantId = ws.tenantId;
    }

    let tenant: AuthorizationContext['tenant'] | undefined;
    if (tenantId) {
      const [t] = await db.select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        plan: tenants.plan,
      }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      if (t) tenant = t;
    }

    return { userId, tenantId: tenantId!, workspaceId, tenant };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const policyEngine = new PolicyEngine();
