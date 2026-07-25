import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './index.ts';
import { users, tenants, workspaces, projects, workspaceMembers, workspaceInvitations, userProjectRestrictions } from './schema.ts';
import { getOrCreateUser } from './queries.ts';
import { eq, and } from 'drizzle-orm';

const ownerUid = `test-invite-owner-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ownerEmail = `${ownerUid}@example.com`;
const inviteeEmail = `invitee-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

let ownerWorkspaceId: number;
let ownerTenantId: string;
let projectId: number;

test.before(async () => {
  const owner = await getOrCreateUser(ownerUid, ownerEmail, 'Invite Owner Test');
  ownerWorkspaceId = owner.activeWorkspaceId!;
  ownerTenantId = owner.activeTenantId!;

  const [project] = await db.insert(projects).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    name: 'Restricted Project Alpha',
    description: 'Project for restricted access testing',
    status: 'planejamento',
    priority: 'Alta',
    owner: ownerUid,
    budget: '50000',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    team: [{ name: 'Owner', uid: ownerUid }],
    progress: 0,
  }).returning();
  projectId = project.id;

  await db.insert(projects).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    name: 'Public Project Beta',
    description: 'Project visible to all members',
    status: 'planejamento',
    priority: 'Média',
    owner: ownerUid,
    budget: '30000',
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    team: [{ name: 'Owner', uid: ownerUid }],
    progress: 0,
  }).returning();

  const [invitation] = await db.insert(workspaceInvitations).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    projectId: projectId,
    email: inviteeEmail,
    role: 'MEMBER',
    teamName: 'Alpha Team',
    department: 'Engineering',
    cargo: 'Developer',
    permissions: ['view_project', 'edit_tasks'],
    inviterUid: ownerUid,
    token: `invite-token-${Date.now()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }).returning();
});

test('invited user with project-scoped invitation gets restricted access', async () => {
  const inviteeUid = `invitee-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.insert(users).values({
    uid: inviteeUid,
    email: inviteeEmail,
    displayName: 'Invited User Test',
  }).onConflictDoNothing();

  await db.insert(workspaceMembers).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    userUid: inviteeUid,
    role: 'MEMBER',
    cargo: 'Developer',
    department: 'Engineering',
    teamName: 'Alpha Team',
    status: 'Ativo',
  }).onConflictDoNothing();

  await db.insert(userProjectRestrictions).values({
    userId: inviteeUid,
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    projectId: projectId,
    invitationId: 1,
  });

  const allowedProjectIds = await db.select({ projectId: userProjectRestrictions.projectId })
    .from(userProjectRestrictions)
    .where(eq(userProjectRestrictions.userId, inviteeUid));

  assert.ok(Array.isArray(allowedProjectIds));
  assert.equal(allowedProjectIds.length, 1);
  assert.equal(allowedProjectIds[0].projectId, projectId);
});

test('invited user can only see restricted project in projects list', async () => {
  const inviteeUid = `invitee-list-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.insert(users).values({
    uid: inviteeUid,
    email: `list-${inviteeUid}@example.com`,
    displayName: 'List Test User',
  }).onConflictDoNothing();

  await db.insert(workspaceMembers).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    userUid: inviteeUid,
    role: 'MEMBER',
    cargo: 'Developer',
    department: 'Engineering',
    status: 'Ativo',
  }).onConflictDoNothing();

  await db.insert(userProjectRestrictions).values({
    userId: inviteeUid,
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    projectId: projectId,
    invitationId: 1,
  });

  const { getProjects } = await import('./queries.ts');
  const projectsList = await getProjects(ownerWorkspaceId, inviteeUid);

  assert.ok(Array.isArray(projectsList));
  assert.equal(projectsList.length, 1);
  assert.equal(projectsList[0].id, projectId);
  assert.equal(projectsList[0].name, 'Restricted Project Alpha');
});

test('invited user cannot access non-restricted project by ID', async () => {
  const inviteeUid = `invitee-access-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.insert(users).values({
    uid: inviteeUid,
    email: `access-${inviteeUid}@example.com`,
    displayName: 'Access Test User',
  }).onConflictDoNothing();

  await db.insert(workspaceMembers).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    userUid: inviteeUid,
    role: 'MEMBER',
    cargo: 'Developer',
    department: 'Engineering',
    status: 'Ativo',
  }).onConflictDoNothing();

  const [otherProject] = await db.select().from(projects)
    .where(and(eq(projects.workspaceId, ownerWorkspaceId), eq(projects.name, 'Public Project Beta')))
    .limit(1);

  await db.insert(userProjectRestrictions).values({
    userId: inviteeUid,
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    projectId: projectId,
    invitationId: 1,
  });

  const { getProjectById } = await import('./queries.ts');
  const restrictedProject = await getProjectById(ownerWorkspaceId, projectId, inviteeUid);
  const publicProject = await getProjectById(ownerWorkspaceId, otherProject!.id, inviteeUid);

  assert.ok(restrictedProject, 'Expected restricted project to be accessible');
  assert.equal(restrictedProject!.id, projectId);
  assert.ok(!publicProject, 'Expected public project to be inaccessible');
});

test('general invitation without projectId grants access to all projects', async () => {
  const generalInviteeUid = `invitee-general-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.insert(users).values({
    uid: generalInviteeUid,
    email: `general-${generalInviteeUid}@example.com`,
    displayName: 'General Invitee Test',
  }).onConflictDoNothing();

  await db.insert(workspaceMembers).values({
    workspaceId: ownerWorkspaceId,
    tenantId: ownerTenantId,
    userUid: generalInviteeUid,
    role: 'MEMBER',
    cargo: 'Developer',
    department: 'Engineering',
    status: 'Ativo',
  }).onConflictDoNothing();

  const { getProjects, getProjectById } = await import('./queries.ts');
  const allProjects = await getProjects(ownerWorkspaceId, generalInviteeUid);
  const anyProject = await getProjectById(ownerWorkspaceId, projectId, generalInviteeUid);

  assert.ok(Array.isArray(allProjects));
  assert.ok(allProjects.length >= 2, 'Expected general invitee to see all projects');
  assert.ok(anyProject, 'Expected general invitee to access any project');
});

test.after(async () => {
  const tx = await db.transaction(async (tx) => {
    await tx.delete(userProjectRestrictions).where(eq(userProjectRestrictions.workspaceId, ownerWorkspaceId));
    await tx.delete(workspaceInvitations).where(eq(workspaceInvitations.workspaceId, ownerWorkspaceId));
    await tx.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, ownerWorkspaceId));
    await tx.delete(projects).where(eq(projects.workspaceId, ownerWorkspaceId));
    await tx.delete(workspaces).where(eq(workspaces.id, ownerWorkspaceId));
    await tx.delete(tenants).where(eq(tenants.id, ownerTenantId));
    await tx.delete(users).where(eq(users.uid, ownerUid));
  });
});
