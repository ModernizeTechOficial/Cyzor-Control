import { db } from '../../db/index.ts';
import { featureFlags, tenants, workspaces, users } from '../../db/schema.ts';
import { and, eq, sql, desc, asc } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type FeatureFlagKey = string;
export type FeatureFlagScope = 'platform' | 'tenant' | 'workspace';

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  scope: FeatureFlagScope;
  tenantId?: string;
  workspaceId?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  isEnabled?: boolean;
  scope?: FeatureFlagScope;
  tenantId?: string;
  workspaceId?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// FEATURE FLAG SERVICE - Enable/disable features per tenant/workspace
// ============================================================================

export class FeatureFlagService {
  // -------------------------------------------------------------------------
  // FEATURE FLAG CRUD
  // -------------------------------------------------------------------------

  async createFlag(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    const [flag] = await db.insert(featureFlags).values({
      key: input.key,
      name: input.name,
      description: input.description || null,
      isEnabled: input.isEnabled ?? false,
      scope: input.scope || 'workspace',
      tenantId: input.tenantId || null,
      workspaceId: input.workspaceId || null,
      metadata: input.metadata || {},
    }).returning();

    return flag;
  }

  async updateFlag(
    key: string,
    scope: FeatureFlagScope,
    tenantId?: string,
    workspaceId?: number,
    updates: Partial<CreateFeatureFlagInput> = {}
  ): Promise<FeatureFlag | null> {
    const conditions = [
      eq(featureFlags.key, key),
      eq(featureFlags.scope, scope),
    ];

    if (scope === 'tenant' && tenantId) {
      conditions.push(eq(featureFlags.tenantId, tenantId));
    } else if (scope === 'workspace' && workspaceId) {
      conditions.push(eq(featureFlags.workspaceId, workspaceId));
    }

    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(and(...conditions))
      .limit(1);

    if (!flag) return null;

    const [updated] = await db
      .update(featureFlags)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning();

    return updated;
  }

  async getFlag(key: string, scope: FeatureFlagScope, tenantId?: string, workspaceId?: number): Promise<FeatureFlag | null> {
    const conditions = [
      eq(featureFlags.key, key),
      eq(featureFlags.scope, scope),
    ];

    if (scope === 'tenant' && tenantId) {
      conditions.push(eq(featureFlags.tenantId, tenantId));
    } else if (scope === 'workspace' && workspaceId) {
      conditions.push(eq(featureFlags.workspaceId, workspaceId));
    }

    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(and(...conditions))
      .limit(1);

    return flag || null;
  }

  async getAllFlags(tenantId?: string, workspaceId?: number): Promise<FeatureFlag[]> {
    const conditions: any[] = [];

    if (tenantId) {
      conditions.push(
        or(
          eq(featureFlags.tenantId, tenantId),
          eq(featureFlags.scope, 'platform')
        )
      );
    }

    if (workspaceId) {
      conditions.push(
        or(
          eq(featureFlags.workspaceId, workspaceId),
          eq(featureFlags.scope, 'tenant'),
          eq(featureFlags.scope, 'platform')
        )
      );
    }

    const allFlags = await db.select().from(featureFlags);
    return allFlags;
  }

  async deleteFlag(key: string, scope: FeatureFlagScope, tenantId?: string, workspaceId?: number): Promise<void> {
    const conditions = [
      eq(featureFlags.key, key),
      eq(featureFlags.scope, scope),
    ];

    if (scope === 'tenant' && tenantId) {
      conditions.push(eq(featureFlags.tenantId, tenantId));
    } else if (scope === 'workspace' && workspaceId) {
      conditions.push(eq(featureFlags.workspaceId, workspaceId));
    }

    await db.delete(featureFlags).where(and(...conditions));
  }

  // -------------------------------------------------------------------------
  // FEATURE CHECKS
  // -------------------------------------------------------------------------

  async isEnabled(
    key: string,
    tenantId?: string,
    workspaceId?: number
  ): Promise<boolean> {
    // Check workspace-level first
    if (workspaceId) {
      const wsFlag = await this.getFlag(key, 'workspace', undefined, workspaceId);
      if (wsFlag) return wsFlag.isEnabled;
    }

    // Check tenant-level
    if (tenantId) {
      const tenantFlag = await this.getFlag(key, 'tenant', tenantId);
      if (tenantFlag) return tenantFlag.isEnabled;
    }

    // Check platform-level
    const platformFlag = await this.getFlag(key, 'platform');
    if (platformFlag) return platformFlag.isEnabled;

    return false;
  }

  async enable(key: string, scope: FeatureFlagScope, tenantId?: string, workspaceId?: number): Promise<void> {
    await this.updateFlag(key, scope, tenantId, workspaceId, { isEnabled: true });
  }

  async disable(key: string, scope: FeatureFlagScope, tenantId?: string, workspaceId?: number): Promise<void> {
    await this.updateFlag(key, scope, tenantId, workspaceId, { isEnabled: false });
  }

  async toggle(key: string, scope: FeatureFlagScope, tenantId?: string, workspaceId?: number): Promise<boolean> {
    const flag = await this.getFlag(key, scope, tenantId, workspaceId);
    if (!flag) return false;

    const newState = !flag.isEnabled;
    await this.updateFlag(key, scope, tenantId, workspaceId, { isEnabled: newState });
    return newState;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const featureFlagService = new FeatureFlagService();
