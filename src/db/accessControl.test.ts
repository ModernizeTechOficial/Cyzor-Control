import test from 'node:test';
import assert from 'node:assert/strict';
import { getMembershipAccess, getSidebarModules, WorkspaceRole, type WorkspaceModule } from './accessControl.ts';

test('owner gets full module access and manager gets restricted access', () => {
  const owner = getMembershipAccess({ role: WorkspaceRole.OWNER, permissions: [] });
  const manager = getMembershipAccess({ role: WorkspaceRole.MANAGER, permissions: [] });

  assert.ok(owner.canAccessModule('dashboard'));
  assert.ok(owner.canAccessModule('financeiro'));
  assert.ok(owner.canAccessModule('configuracoes'));

  assert.ok(manager.canAccessModule('dashboard'));
  assert.ok(manager.canAccessModule('agenda'));
  assert.ok(!manager.canAccessModule('financeiro'));
  assert.ok(!manager.canAccessModule('configuracoes'));
});

test('permissions can expand access for employee members', () => {
  const employee = getMembershipAccess({ role: WorkspaceRole.MEMBER, permissions: ['view_finance'] });

  assert.ok(employee.canAccessModule('agenda'));
  assert.ok(employee.canAccessModule('documentacao'));
  assert.ok(employee.canAccessModule('financeiro'));
  assert.ok(!employee.canAccessModule('configuracoes'));
});

test('sidebar modules are generated from the membership profile', () => {
  const modules = getSidebarModules({ role: WorkspaceRole.MANAGER, permissions: [] });
  const ids = modules.map((module) => module.id);

  assert.ok(ids.includes('dashboard'));
  assert.ok(ids.includes('equipe'));
  assert.ok(!ids.includes('financeiro'));
});
