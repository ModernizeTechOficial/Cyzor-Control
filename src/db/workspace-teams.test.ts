import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './index.ts';
import { users, tenants, workspaces, companies, userTenants, workspaceMembers } from './schema.ts';
import { getOrCreateUser } from './queries.ts';
import { eq, and } from 'drizzle-orm';

const uid = `test-team-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `${uid}@example.com`;

let tenantId: string;
let workspaceId: number;
let memberUid: string;

test.before(async () => {
  const user = await getOrCreateUser(uid, email, 'Team Owner Test');
  tenantId = user.activeTenantId!;
  workspaceId = user.activeWorkspaceId!;

  memberUid = `member-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.insert(users).values({
    uid: memberUid,
    email: `${memberUid}@example.com`,
    displayName: 'Team Member Test',
  }).onConflictDoNothing();

  await db.insert(workspaceMembers).values({
    workspaceId,
    tenantId,
    userUid: memberUid,
    role: 'MEMBER',
    cargo: 'Developer',
    department: 'Engineering',
    status: 'Ativo',
  }).onConflictDoNothing();
});

test('getOrCreateUser provisions workspace, tenant, company and owner membership', async () => {
  const user = await getOrCreateUser(uid, email, 'Team Owner Test', null);
  assert.equal(user.uid, uid);
  assert.ok(user.activeWorkspaceId);
  assert.ok(user.activeTenantId);

  const [membership] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userUid, uid)).limit(1);
  assert.ok(membership);
  assert.equal(membership.role, 'OWNER');
  assert.equal(membership.userUid, uid);
});

test('workspace member can be queried and enriched with user data', async () => {
  const members = await db.select({
    id: workspaceMembers.id,
    userUid: workspaceMembers.userUid,
    role: workspaceMembers.role,
    cargo: workspaceMembers.cargo,
    department: workspaceMembers.department,
    userName: users.displayName,
    userEmail: users.email,
  })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userUid, users.uid))
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  assert.ok(Array.isArray(members));
  assert.ok(members.length >= 2, 'Expected at least owner and one member');

  const owner = members.find((m) => m.userUid === uid);
  assert.ok(owner, 'Expected owner member in result');
  assert.equal(owner.role, 'OWNER');

  const regular = members.find((m) => m.userUid === memberUid);
  assert.ok(regular, 'Expected regular member in result');
  assert.equal(regular.role, 'MEMBER');
  assert.equal(regular.cargo, 'Developer');
  assert.equal(regular.department, 'Engineering');
});

test('workspace settings organizationalTeams can store team data', async () => {
  const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const settings = (workspace?.settings || {}) as any;

  const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];

  const [member] = await db.select({ id: workspaceMembers.id }).from(workspaceMembers).where(eq(workspaceMembers.userUid, memberUid)).limit(1);
  const createdTeam = {
    id: `team-${Date.now()}`,
    name: 'Engineering Core',
    description: 'Core engineering team',
    ownerId: uid,
    memberIds: member ? [member.id] : [],
    createdAt: new Date().toISOString(),
  };

  settings.organizationalTeams = [createdTeam, ...teams];

  await db.update(workspaces)
    .set({ settings })
    .where(eq(workspaces.id, workspaceId));

  const [updated] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const updatedTeams = (updated?.settings || {}) as any;
  assert.ok(Array.isArray(updatedTeams.organizationalTeams));
  assert.equal(updatedTeams.organizationalTeams[0].name, 'Engineering Core');
  assert.equal(updatedTeams.organizationalTeams[0].ownerId, uid);
});

test('team membership can be updated', async () => {
  await db.update(workspaceMembers)
    .set({ role: 'ADMIN', cargo: 'Tech Lead' })
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userUid, memberUid)))
    .returning();

  const [updated] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userUid, memberUid)).limit(1);
  assert.equal(updated.role, 'ADMIN');
  assert.equal(updated.cargo, 'Tech Lead');
});

test('workspace settings organizationalTeams can be updated', async () => {
  const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const settings = (workspace?.settings || {}) as any;
  const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];

  if (teams.length === 0) {
    assert.fail('Expected at least one team to exist for update test');
    return;
  }

  const updatedName = 'Engineering Core - Updated';
  teams[0] = { ...teams[0], name: updatedName, description: 'Updated description' };

  await db.update(workspaces)
    .set({ settings: { ...settings, organizationalTeams: teams } })
    .where(eq(workspaces.id, workspaceId));

  const [updated] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const updatedSettings = (updated?.settings || {}) as any;
  assert.equal(updatedSettings.organizationalTeams[0].name, updatedName);
});

test('workspace settings organizationalTeams can be deleted', async () => {
  const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const settings = (workspace?.settings || {}) as any;
  const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];

  if (teams.length === 0) {
    assert.fail('Expected at least one team to exist for delete test');
    return;
  }

  const filteredTeams = teams.filter((team: any) => team.id !== teams[0].id);

  await db.update(workspaces)
    .set({ settings: { ...settings, organizationalTeams: filteredTeams } })
    .where(eq(workspaces.id, workspaceId));

  const [updated] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  const updatedSettings = (updated?.settings || {}) as any;
  assert.ok(!updatedSettings.organizationalTeams.some((t: any) => t.id === teams[0].id));
});

test.after(async () => {
  const tx = await db.transaction(async (tx) => {
    await tx.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
    await tx.delete(workspaces).where(eq(workspaces.id, workspaceId));
    await tx.delete(tenants).where(eq(tenants.id, tenantId));
    await tx.delete(users).where(eq(users.uid, memberUid));
    await tx.delete(users).where(eq(users.uid, uid));
  });
});
