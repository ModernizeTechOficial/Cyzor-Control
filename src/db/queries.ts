import { db } from './index.ts';
import { users, workspaces, workspaceMembers, companies, products, projects, tasks, ideas, documents, financeEntries, aiHistory, flows } from './schema.ts';
import { eq, and } from 'drizzle-orm';

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
      }).returning();

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
      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userUid: uid,
        role: 'OWNER',
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
