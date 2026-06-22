import { db } from './index.ts';
import { users, workspaces, workspaceMembers, companies, products, projects, tasks, ideas, documents, financeEntries, aiHistory } from './schema.ts';
import { eq, and, desc, asc } from 'drizzle-orm';

// --- USERS & WORKSPACES ---

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string
) {
  try {
    // Check if user exists
    let userResult = await db.select().from(users).where(eq(users.uid, uid));
    let user = userResult[0];

    if (!user) {
      // Create user
      const insertedUsers = await db.insert(users).values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
        currentPlan: 'Pro',
      }).returning();
      user = insertedUsers[0];

      // Automatically create a default workspace
      const defaultWorkspaceName = displayName ? `Workspace de ${displayName}` : 'Meu Workspace';
      const insertedWorkspaces = await db.insert(workspaces).values({
        name: defaultWorkspaceName,
        ownerUid: uid,
        plan: 'Pro',
      }).returning();
      const workspace = insertedWorkspaces[0];

      // Make user a member
      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userUid: uid,
        role: 'OWNER',
      });

      // Update active workspace
      await db.update(users).set({ activeWorkspaceId: workspace.id }).where(eq(users.uid, uid));
      user.activeWorkspaceId = workspace.id;
    } else {
      // Update basic info
      const updatedUsers = await db.update(users).set({
        displayName: displayName || user.displayName,
        photoUrl: photoUrl || user.photoUrl,
        updatedAt: new Date(),
      }).where(eq(users.uid, uid)).returning();
      user = updatedUsers[0];
    }

    return user;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to get or create user in database.', { cause: error });
  }
}

export async function getUserWorkspaces(uid: string) {
  const result = await db.select({
    id: workspaces.id,
    name: workspaces.name,
    plan: workspaces.plan,
    role: workspaceMembers.role,
  })
  .from(workspaceMembers)
  .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
  .where(eq(workspaceMembers.userUid, uid));
  return result;
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