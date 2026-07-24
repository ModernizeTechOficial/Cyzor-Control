import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { tenantContextStorage, TenantContextType } from '../db/context.ts';
import { getUserSaaSState } from '../db/queries.ts';
import { onboardingService } from '../services/OnboardingService';

export interface TenantRequest extends AuthRequest {
  tenantId?: string;
  tenant?: typeof schema.tenants.$inferSelect;
  companyId?: number;
  company?: typeof schema.companies.$inferSelect;
}

export const tenantMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication' });
    }

    const userId = req.user.uid;

    let state = await getUserSaaSState(userId);
    let activeWorkspaceId = state?.activeWorkspace?.id;

    if (!activeWorkspaceId) {
      console.log(`[Tenant Middleware] No active workspace for user ${userId}. Attempting fallback...`);
      const userWorkspaces = await db.select({ workspaceId: schema.workspaceMembers.workspaceId })
        .from(schema.workspaceMembers)
        .where(eq(schema.workspaceMembers.userUid, userId))
        .limit(1);
      
      if (userWorkspaces.length > 0) {
        activeWorkspaceId = userWorkspaces[0].workspaceId;
        console.log(`[Tenant Middleware] Falling back to workspace ${activeWorkspaceId} for user ${userId}`);
        await db.update(schema.users).set({ activeWorkspaceId }).where(eq(schema.users.uid, userId));
      } else {
        return res.status(403).json({ error: 'No active workspace resolved for this user. Please create or join a workspace first.' });
      }
    }

    req.workspaceId = activeWorkspaceId;

    const [workspace] = await db.select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, activeWorkspaceId))
      .limit(1);

    let tenantId = workspace?.tenantId;
    let tenantName = workspace?.name || 'My Tenant';

    let tenant = null;
    if (tenantId) {
      const [t] = await db.select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, tenantId))
        .limit(1);
      tenant = t;
    }

    if (!workspace || !tenantId || !tenant) {
      console.log(`[Tenant Middleware] Self-healing active: Workspace ${activeWorkspaceId} lacks tenant or tenant not found. Healing...`);
      
      const healed = await onboardingService.healAccount(userId);
      if (!healed) {
        return res.status(500).json({ error: 'Failed to heal account structure' });
      }

      const [healedWorkspace] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, healed.workspaceId)).limit(1);
      const [healedTenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.id, healed.tenantId)).limit(1);
      
      req.workspaceId = healed.workspaceId;
      req.tenantId = healed.tenantId;
      req.tenant = healedTenant;
      req.companyId = healed.companyId;

      const context: TenantContextType = {
        tenantId: healed.tenantId,
        userId,
        tenant: {
          id: healedTenant.id,
          name: healedTenant.name,
          slug: healedTenant.slug,
          plan: healedTenant.plan || 'Free',
        },
      };

      tenantContextStorage.run(context, () => next());
      return;
    }

    // Startup Validation: ensure complete account structure
    const startupValid = await validateAccountStructure(userId, activeWorkspaceId, tenantId);
    if (!startupValid.valid) {
      console.warn(`[Tenant Middleware] Startup validation failed: ${startupValid.reason}. Healing...`);
      const healed = await onboardingService.healAccount(userId);
      if (healed) {
        const [healedWorkspace] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, healed.workspaceId)).limit(1);
        const [healedTenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.id, healed.tenantId)).limit(1);
        req.workspaceId = healed.workspaceId;
        req.tenantId = healed.tenantId;
        req.tenant = healedTenant;
        req.companyId = healed.companyId;
      }
    }

    const [membership] = await db.select()
      .from(schema.userTenants)
      .where(
        eq(schema.userTenants.userId, userId)
      )
      .limit(1);

    if (!membership) {
      console.log(`[Tenant Middleware] Dynamically onboarding user ${userId} to Tenant ${tenantId}...`);
      await db.insert(schema.userTenants).values({
        userId,
        tenantId,
        role: 'MEMBER',
        isOwner: workspace?.ownerUid === userId,
      }).onConflictDoNothing();
    }

    req.tenantId = tenantId;
    req.tenant = tenant;

    try {
      const [existingCompany] = await db.select().from(schema.companies).where(eq(schema.companies.workspaceId, activeWorkspaceId)).limit(1);
      if (!existingCompany) {
        const [newCompany] = await db.insert(schema.companies).values({
          tenantId: tenantId,
          workspaceId: activeWorkspaceId,
          name: workspace?.name ? `${workspace.name} Matriz` : `Empresa Workspace ${activeWorkspaceId}`,
          status: 'Ativo'
        }).returning();
        req.companyId = newCompany.id;
        req.company = newCompany;
        console.log(`[Tenant Middleware] Auto-created company ${newCompany.id} for workspace ${activeWorkspaceId}`);
      } else {
        req.companyId = existingCompany.id;
        req.company = existingCompany;
      }
    } catch (err) {
      console.warn('[Tenant Middleware] Error ensuring company exists for workspace:', err?.message || err);
    }

    const context: TenantContextType = {
      tenantId,
      userId,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan || 'Free',
      },
    };

    tenantContextStorage.run(context, () => {
      next();
    });

  } catch (error: any) {
    console.error('[Tenant Middleware Error] Failed to resolve tenant:', error);
    res.status(500).json({ error: 'Internal server error resolving tenant isolation scope' });
  }
};

// ============================================================================
// STARTUP VALIDATOR - Ensures complete account structure
// ============================================================================

async function validateAccountStructure(
  userId: string,
  workspaceId: number,
  tenantId: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const [workspace] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, workspaceId)).limit(1);
    if (!workspace) return { valid: false, reason: 'missing_workspace' };

    const [tenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId)).limit(1);
    if (!tenant) return { valid: false, reason: 'missing_tenant' };

    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.workspaceId, workspaceId)).limit(1);
    if (!company) return { valid: false, reason: 'missing_company' };

    const [membership] = await db.select().from(schema.workspaceMembers)
      .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId)))
      .limit(1);
    if (!membership) return { valid: false, reason: 'missing_membership' };

    const [user] = await db.select().from(schema.users).where(eq(schema.users.uid, userId)).limit(1);
    if (!user) return { valid: false, reason: 'missing_user' };

    if (!user.activeWorkspaceId || user.activeWorkspaceId !== workspaceId) {
      return { valid: false, reason: 'invalid_active_workspace' };
    }

    if (!user.activeTenantId || user.activeTenantId !== tenantId) {
      return { valid: false, reason: 'invalid_active_tenant' };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Startup Validator] Error validating account structure:', error);
    return { valid: false, reason: 'validation_error' };
  }
}
