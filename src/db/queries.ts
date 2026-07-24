import { db } from './index.ts';
import { users, workspaces, workspaceMembers, companies, tenants, products, projects, tasks, ideas, documents, financeEntries, aiHistory, flows } from './schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import { startProvisioningTrace, getProvisioningLogger, endProvisioningTrace } from '../lib/provisioning/ProvisioningLogger.ts';
import { ProvisioningError } from '../lib/provisioning/ProvisioningError.ts';

// --- SCHEMA INTROSPECTION CACHE ---
let workspaceMembersColumnsCache: string[] | null = null;

async function getWorkspaceMembersColumns(): Promise<string[]> {
  if (workspaceMembersColumnsCache !== null) {
    return workspaceMembersColumnsCache;
  }

  try {
    const result = await db.execute(
      sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workspace_members' 
        ORDER BY ordinal_position
      `
    );

    const columns = result.rows.map((row: any) => row.column_name);
    workspaceMembersColumnsCache = columns;
    console.log(`[SchemaAdapter] workspace_members columns detected: ${columns.join(', ')}`);
    return columns;
  } catch (error) {
    console.warn('[SchemaAdapter] Failed to introspect schema, using minimal fallback:', error);
    workspaceMembersColumnsCache = ['id', 'tenant_id', 'workspace_id', 'user_uid', 'role', 'cargo', 'department', 'team_name', 'manager_uid', 'permissions', 'status', 'created_at'];
    return workspaceMembersColumnsCache;
  }
}

async function safeInsertWorkspaceMember(values: {
  workspaceId: number;
  userUid: string;
  tenantId?: string;
  role?: string;
  cargo?: string;
  department?: string;
  teamName?: string;
  managerUid?: string;
  permissions?: any;
  status?: string;
  onboardingCompleted?: boolean;
  xp?: number;
  careerLevel?: string;
}) {
  const availableColumns = await getWorkspaceMembersColumns();
  
  const insertValues: any = {};
  
  if (availableColumns.includes('workspace_id')) insertValues.workspaceId = values.workspaceId;
  if (availableColumns.includes('user_uid')) insertValues.userUid = values.userUid;
  if (availableColumns.includes('role')) insertValues.role = values.role || 'MEMBER';
  if (availableColumns.includes('cargo')) insertValues.cargo = values.cargo || 'Colaborador';
  if (availableColumns.includes('department')) insertValues.department = values.department || null;
  if (availableColumns.includes('team_name')) insertValues.teamName = values.teamName || null;
  if (availableColumns.includes('manager_uid')) insertValues.managerUid = values.managerUid || null;
  if (availableColumns.includes('permissions')) insertValues.permissions = values.permissions || [];
  if (availableColumns.includes('status')) insertValues.status = values.status || 'Ativo';
  
  if (availableColumns.includes('tenant_id') && values.tenantId) {
    insertValues.tenantId = values.tenantId;
  }
  
  if (availableColumns.includes('onboarding_completed')) insertValues.onboardingCompleted = values.onboardingCompleted ?? false;
  if (availableColumns.includes('xp')) insertValues.xp = values.xp ?? 0;
  if (availableColumns.includes('career_level')) insertValues.careerLevel = values.careerLevel || 'Pleno';
  
  return await db.insert(workspaceMembers).values(insertValues).returning();
}

// --- USERS & WORKSPACES ---

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string
) {
  const logger = startProvisioningTrace(uid);
  const startTime = Date.now();

  try {
    logger.info('GET_OR_CREATE_USER', 'Starting provisioning flow', {
      params: { uid, email, displayName, photoUrl }
    });

    const result = await db.transaction(async (tx) => {
      // Step 1: Ensure user exists
      const step1Start = Date.now();
      logger.info('STEP_1', 'Ensuring user exists', {
        params: { uid, email, displayName, photoUrl }
      });

      const [existingUser] = await tx.select().from(users).where(eq(users.uid, uid));

      let user;
      if (existingUser) {
        await tx.update(users).set({
          displayName: displayName || existingUser.displayName,
          photoUrl: photoUrl || existingUser.photoUrl,
          updatedAt: new Date(),
        }).where(eq(users.uid, uid));
        
        const [updatedUser] = await tx.select().from(users).where(eq(users.uid, uid));
        user = updatedUser || existingUser;
        logger.info('STEP_1', 'User already exists', { createdIds: { userId: user.id, uid: user.uid } });
      } else {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        const [insertedUser] = await tx.insert(users).values({
          uid,
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
          currentPlan: 'free',
          trialEndsAt,
          settings: {},
        }).returning();

        user = insertedUser;
        logger.info('STEP_1', 'User created', { 
          createdIds: { userId: user.id, uid: user.uid },
          durationMs: Date.now() - step1Start 
        });
      }

      // Step 2: Ensure workspace exists
      let workspace = null;
      if (user.activeWorkspaceId) {
        const [existingWs] = await tx.select().from(workspaces).where(eq(workspaces.id, user.activeWorkspaceId));
        if (existingWs) {
          workspace = existingWs;
          logger.info('STEP_2', 'Active workspace already exists', { 
            createdIds: { workspaceId: workspace.id, tenantId: workspace.tenantId }
          });
        }
      }

      if (!workspace) {
        const step2Start = Date.now();

        // Create tenant with deterministic slug
        const tenantSlug = `tenant-${uid.toLowerCase()}-${Date.now()}`;
        logger.info('STEP_2A', 'Creating tenant', {
          params: { slug: tenantSlug, name: `${displayName || email}'s Organization` }
        });

        const [tenant] = await tx.insert(tenants).values({
          name: `${displayName || email}'s Organization`,
          slug: tenantSlug,
          plan: 'Pro',
          status: 'Active',
        }).returning();

        logger.info('STEP_2A', 'Tenant created', { 
          createdIds: { tenantId: tenant.id, slug: tenant.slug },
          durationMs: Date.now() - step2Start 
        });

        // Create workspace with explicit tenantId
        const step2bStart = Date.now();
        logger.info('STEP_2B', 'Creating workspace with explicit tenantId', {
          params: { tenantId: tenant.id, name: displayName ? `Workspace de ${displayName}` : 'Meu Workspace', ownerUid: uid }
        });

        const [insertedWorkspace] = await tx.insert(workspaces).values({
          tenantId: tenant.id,
          name: displayName ? `Workspace de ${displayName}` : 'Meu Workspace',
          ownerUid: uid,
          plan: 'free',
          settings: {
            onboardingCompleted: false,
            createdAt: new Date().toISOString(),
          },
        }).returning();

        workspace = insertedWorkspace;
        logger.info('STEP_2B', 'Workspace created', { 
          createdIds: { workspaceId: workspace.id, tenantId: workspace.tenantId },
          durationMs: Date.now() - step2bStart 
        });

        // Step 3: Create company
        const step3Start = Date.now();
        logger.info('STEP_3', 'Creating default company', {
          params: { workspaceId: workspace.id, tenantId: workspace.tenantId, name: `${workspace.name} Matriz` }
        });

        const [company] = await tx.insert(companies).values({
          workspaceId: workspace.id,
          tenantId: workspace.tenantId,
          name: `${workspace.name} Matriz`,
          status: 'Ativo'
        }).returning();

        logger.info('STEP_3', 'Company created', { 
          createdIds: { companyId: company.id, tenantId: company.tenantId },
          durationMs: Date.now() - step3Start 
        });

        // Step 4: Create workspace membership (OWNER)
        const step4Start = Date.now();
        logger.info('STEP_4', 'Creating workspace membership (OWNER)', {
          params: { workspaceId: workspace.id, userUid: uid, tenantId: workspace.tenantId, role: 'OWNER' }
        });

        const [membership] = await tx.insert(workspaceMembers).values({
          workspaceId: workspace.id,
          userUid: uid,
          tenantId: workspace.tenantId,
          role: 'OWNER',
          cargo: 'Proprietário',
          department: 'Administração',
          teamName: 'Owner',
          status: 'Ativo',
          permissions: [],
          onboardingCompleted: false,
          xp: 0,
          careerLevel: 'Pleno',
        }).returning();

        logger.info('STEP_4', 'Workspace membership created', { 
          createdIds: { membershipId: membership.id, tenantId: membership.tenantId },
          durationMs: Date.now() - step4Start 
        });

        // Step 5: Update user active references
        const step5Start = Date.now();
        logger.info('STEP_5', 'Updating user active workspace and tenant references', {
          params: { userId: user.id, activeWorkspaceId: workspace.id, activeTenantId: workspace.tenantId }
        });

        await tx.update(users).set({ 
          activeWorkspaceId: workspace.id,
          activeTenantId: workspace.tenantId,
          updatedAt: new Date(),
        }).where(eq(users.uid, uid));

        logger.info('STEP_5', 'User references updated', { 
          durationMs: Date.now() - step5Start 
        });

        logger.info('PROVISIONING_COMPLETE', 'Full provisioning completed successfully', {
          createdIds: { 
            userId: user.id, 
            workspaceId: workspace.id, 
            tenantId: workspace.tenantId,
            companyId: company.id,
            membershipId: membership.id 
          },
          durationMs: Date.now() - startTime
        });
      } else if (!user.activeWorkspaceId || user.activeWorkspaceId !== workspace.id) {
        const step5Start = Date.now();
        await tx.update(users).set({ 
          activeWorkspaceId: workspace.id,
          activeTenantId: workspace.tenantId,
          updatedAt: new Date(),
        }).where(eq(users.uid, uid));
        
        logger.info('STEP_5', 'User active workspace reference corrected', {
          params: { userId: user.id, activeWorkspaceId: workspace.id },
          durationMs: Date.now() - step5Start
        });
      }

      return user;
    });

    endProvisioningTrace(true);
    return result;

  } catch (error) {
    endProvisioningTrace(false);
    const provisioningError = logger.createProvisioningError(
      'getOrCreateUser',
      'Provisioning transaction failed',
      error,
      { userUid: uid }
    );
    throw provisioningError;
  }
}

// --- GENERIC CRUD ---

export async function getUserWorkspaces(uid: string) {
  try {
    return await db.select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userUid, uid));
  } catch (error: any) {
    console.error('Error fetching workspaces:', error);
    throw new Error('Failed to fetch workspaces: ' + (error.message || String(error)));
  }
}

export const getWorkspacesWithMembership = getUserWorkspaces;

export { safeInsertWorkspaceMember };

export async function updateUserActiveWorkspace(uid: string, workspaceId: number) {
  const member = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.userUid, uid), eq(workspaceMembers.workspaceId, workspaceId)));
  if (member.length === 0) throw new Error('Not a member of this workspace');

  await db.update(users).set({ activeWorkspaceId: workspaceId }).where(eq(users.uid, uid));
  return true;
}

export async function getUserSaaSState(uid: string) {
  const result = await db.select().from(users).where(eq(users.uid, uid));
  if (!result[0]) return null;
  const user = result[0];
  let activeWorkspace = null;
  if (user.activeWorkspaceId) {
    const ws = await db.select().from(workspaces).where(eq(workspaces.id, user.activeWorkspaceId));
    activeWorkspace = ws[0] || null;
  }
  return { user, activeWorkspace };
}

export async function getCompanies(workspaceId: number) {
  return db.select().from(companies).where(eq(companies.workspaceId, workspaceId));
}

export async function getProjects(workspaceId: number) {
  return db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
}

export async function getIdeas(workspaceId: number) {
  return db.select().from(ideas).where(eq(ideas.workspaceId, workspaceId));
}

export async function getFinanceEntries(workspaceId: number) {
  return db.select().from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId));
}

export async function getDocuments(workspaceId: number) {
  return db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
}

export async function getFlows(workspaceId: number) {
  return db.select().from(flows).where(eq(flows.workspaceId, workspaceId));
}

export async function getFlowById(workspaceId: number, flowId: number) {
  const result = await db.select().from(flows).where(and(eq(flows.workspaceId, workspaceId), eq(flows.id, flowId)));
  return result[0];
}
