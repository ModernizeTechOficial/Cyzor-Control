import { db } from './index.ts';
import { users, workspaces, workspaceMembers, companies, products, projects, tasks, ideas, documents, financeEntries, aiHistory, flows } from './schema.ts';
import { eq, and, sql } from 'drizzle-orm';

// --- SCHEMA INTROSPECTION CACHE ---
let workspaceMembersColumnsCache: string[] | null = null;

/**
 * Dynamically discovers which columns actually exist in the workspace_members table.
 * This makes the code resilient to schema drift (old/new database versions).
 */
async function getWorkspaceMembersColumns(): Promise<string[]> {
  if (workspaceMembersColumnsCache !== null) {
    return workspaceMembersColumnsCache;
  }

  try {
    // Query information_schema to get actual column names
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
    // Fallback to minimal set that definitely exists in both old and new schemas
    workspaceMembersColumnsCache = ['id', 'tenant_id', 'workspace_id', 'user_uid', 'role', 'cargo', 'department', 'team_name', 'manager_uid', 'permissions', 'status', 'created_at'];
    return workspaceMembersColumnsCache;
  }
}

/**
 * Inserts into workspace_members using only columns that exist in the actual database.
 */
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
  
  // Build insert with only available columns
  const insertValues: any = {};
  
  // Always safe columns
  if (availableColumns.includes('workspace_id')) insertValues.workspaceId = values.workspaceId;
  if (availableColumns.includes('user_uid')) insertValues.userUid = values.userUid;
  if (availableColumns.includes('role')) insertValues.role = values.role || 'MEMBER';
  if (availableColumns.includes('cargo')) insertValues.cargo = values.cargo || 'Colaborador';
  if (availableColumns.includes('department')) insertValues.department = values.department || null;
  if (availableColumns.includes('team_name')) insertValues.teamName = values.teamName || null;
  if (availableColumns.includes('manager_uid')) insertValues.managerUid = values.managerUid || null;
  if (availableColumns.includes('permissions')) insertValues.permissions = values.permissions || [];
  if (availableColumns.includes('status')) insertValues.status = values.status || 'Ativo';
  
  // tenant_id (usually NOT NULL with default, but we provide if available)
  if (availableColumns.includes('tenant_id') && values.tenantId) {
    insertValues.tenantId = values.tenantId;
  }
  
  // New schema columns (may not exist)
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
  try {
    let [user] = await db.select().from(users).where(eq(users.uid, uid));

    if (!user) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      [user] = await db.insert(users).values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
        currentPlan: 'free',
        trialEndsAt: trialEndsAt
      }).returning();

  const [workspace] = await db.insert(workspaces).values({
    name: displayName ? `Workspace de ${displayName}` : 'Meu Workspace',
    ownerUid: uid,
    plan: 'free',
    settings: {
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    },
  }).returning();

      // Ensure we have the generated tenantId from the inserted workspace.
      // Some drivers/clients may not populate default-generated columns on the
      // returned insert object, so fetch the workspace row explicitly if
      // `tenantId` is missing.
      if (!workspace.tenantId) {
        try {
          const refreshed = await db.select().from(workspaces).where(eq(workspaces.id, workspace.id)).limit(1);
          if (refreshed && refreshed[0]) {
            workspace.tenantId = refreshed[0].tenantId;
          }
        } catch (err) {
          console.warn('Could not refresh workspace to read tenantId:', err?.message || err);
        }
      }

      try {
        const [existingCompany] = await db.select().from(companies).where(eq(companies.workspaceId, workspace.id)).limit(1);
        if (!existingCompany) {
          await db.insert(companies).values({
            workspaceId: workspace.id,
            tenantId: workspace.tenantId || null,
            name: `${workspace.name} Matriz`,
            status: 'Ativo'
          }).returning();
        }
      } catch (err) {
        console.warn('Warning while creating default company for new workspace:', err?.message || err);
      }

      await safeInsertWorkspaceMember({
        workspaceId: workspace.id,
        userUid: uid,
        role: 'OWNER',
        tenantId: workspace.tenantId,
      });

      await db.update(users).set({ activeWorkspaceId: workspace.id }).where(eq(users.uid, uid));
      user.activeWorkspaceId = workspace.id;
    } else {
      [user] = await db.update(users).set({
        displayName: displayName || user.displayName,
        photoUrl: photoUrl || user.photoUrl,
        updatedAt: new Date(),
      }).where(eq(users.uid, uid)).returning();
    }
    return user;
  } catch (error: any) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to get or create user in database: ' + (error.message || String(error)));
  }
}

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

// Alias for compatibility
export const getWorkspacesWithMembership = getUserWorkspaces;

// Export the safe insert function for use in other services
export { safeInsertWorkspaceMember };

export async function updateUserActiveWorkspace(uid: string, workspaceId: number) {
  // verify membership
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

// --- GENERIC CRUD ---

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
