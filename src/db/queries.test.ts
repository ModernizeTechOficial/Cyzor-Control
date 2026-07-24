import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './index.ts';
import { users, tenants, workspaces, companies, userTenants, workspaceMembers } from './schema.ts';
import { getOrCreateUser } from './queries.ts';
import { eq } from 'drizzle-orm';

test('getOrCreateUser provisions workspace, tenant, company and owner membership', async () => {
  const uid = `test-onboarding-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `${uid}@example.com`;
  const displayName = 'Cyzor QA Test';

  const user = await getOrCreateUser(uid, email, displayName, null);
  assert.equal(user.uid, uid, 'Expected created user UID to match');
  assert.ok(user.activeWorkspaceId, 'Expected activeWorkspaceId to be set');
  assert.ok(user.activeTenantId, 'Expected activeTenantId to be set');

  const [membership] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userUid, uid)).limit(1);
  assert.ok(membership, 'Expected workspace membership to exist for the new user');
  assert.equal(membership.role, 'OWNER', 'Expected membership role to be OWNER');
  assert.equal(membership.userUid, uid, 'Expected membership user_uid to match the created user');

  await db.transaction(async (tx) => {
    await tx.delete(workspaceMembers).where(eq(workspaceMembers.userUid, uid));
    await tx.delete(userTenants).where(eq(userTenants.userId, uid));
    await tx.delete(companies).where(eq(companies.workspaceId, user.activeWorkspaceId));
    await tx.delete(workspaces).where(eq(workspaces.id, user.activeWorkspaceId));
    await tx.delete(tenants).where(eq(tenants.id, user.activeTenantId));
    await tx.delete(users).where(eq(users.uid, uid));
  });
});
