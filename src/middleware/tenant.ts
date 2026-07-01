import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { tenantContextStorage, TenantContextType } from '../db/context.ts';
import { getUserSaaSState } from '../db/queries.ts';

export interface TenantRequest extends AuthRequest {
  tenantId?: string;
  tenant?: typeof schema.tenants.$inferSelect;
}

/**
 * Resolves the active tenant for the authenticated user and runs the request
 * within the Tenant Context (AsyncLocalStorage) for automatic transparent multi-tenancy.
 */
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

    // 1. Resolve active workspace ID from database
    let state = await getUserSaaSState(userId);
    let activeWorkspaceId = state?.activeWorkspace?.id;

    if (!activeWorkspaceId) {
      console.log(`[Tenant Middleware] No active workspace for user ${userId}. Attempting fallback...`);
      // Fallback: Pick the first workspace the user belongs to
      const userWorkspaces = await db.select({ workspaceId: schema.workspaceMembers.workspaceId })
        .from(schema.workspaceMembers)
        .where(eq(schema.workspaceMembers.userUid, userId))
        .limit(1);
      
      if (userWorkspaces.length > 0) {
        activeWorkspaceId = userWorkspaces[0].workspaceId;
        console.log(`[Tenant Middleware] Falling back to workspace ${activeWorkspaceId} for user ${userId}`);
        // Optionally update the user's active workspace in DB for next time
        await db.update(schema.users).set({ activeWorkspaceId }).where(eq(schema.users.uid, userId));
      } else {
        return res.status(403).json({ error: 'No active workspace resolved for this user. Please create or join a workspace first.' });
      }
    }

    req.workspaceId = activeWorkspaceId;

    // 2. Fetch the corresponding Tenant
    const [workspace] = await db.select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, activeWorkspaceId))
      .limit(1);

    let tenantId = workspace?.tenantId;
    let tenantName = workspace?.name || 'My Tenant';

    // Fetch the full tenant details if tenantId is available
    let tenant = null;
    if (tenantId) {
      const [t] = await db.select()
        .from(schema.tenants)
        .where(eq(schema.tenants.id, tenantId))
        .limit(1);
      tenant = t;
    }

    // Self-healing check: If the workspace lacks a tenantId, or the tenant doesn't exist, create one dynamically!
    if (!workspace || !tenantId || !tenant) {
      console.log(`[Tenant Middleware] Self-healing active: Workspace ${activeWorkspaceId} lacks tenant or tenant not found. Creating one...`);
      
      const slug = `workspace-${activeWorkspaceId}-${Date.now()}`;
      const [newTenant] = await db.insert(schema.tenants).values({
        name: tenantName,
        slug,
        plan: workspace?.plan || 'Pro',
      }).returning();

      tenantId = newTenant.id;
      tenant = newTenant;

      if (workspace) {
        await db.update(schema.workspaces)
          .set({ tenantId })
          .where(eq(schema.workspaces.id, activeWorkspaceId));
      }
    }

    // 3. Ensure user belongs to this tenant (Association validation)
    const [membership] = await db.select()
      .from(schema.userTenants)
      .where(
        eq(schema.userTenants.userId, userId)
      )
      .limit(1);

    // If membership doesn't exist, create it dynamically (auto-onboarding)
    if (!membership) {
      console.log(`[Tenant Middleware] Dynamically onboarding user ${userId} to Tenant ${tenantId}...`);
      await db.insert(schema.userTenants).values({
        userId,
        tenantId,
        role: 'MEMBER',
        isOwner: workspace?.ownerUid === userId,
      }).onConflictDoNothing();
    }

    // 4. Inject tenant and workspace details into request
    req.tenantId = tenantId;
    req.tenant = tenant;

    // 5. Initialize the AsyncLocalStorage Context Store
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

    // Wrap request execution in AsyncLocalStorage so all downstream database calls
    // automatically access this context.
    tenantContextStorage.run(context, () => {
      next();
    });

  } catch (error: any) {
    console.error('[Tenant Middleware Error] Failed to resolve tenant:', error);
    res.status(500).json({ error: 'Internal server error resolving tenant isolation scope' });
  }
};
