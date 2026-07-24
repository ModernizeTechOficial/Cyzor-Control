export { authorizationEngine, AuthorizationEngine } from './AuthorizationEngine.ts';
export { roleEngine, RoleEngine } from './RoleEngine.ts';
export { policyEngine, PolicyEngine } from './PolicyEngine.ts';

export type {
  AuthorizationContext,
  AuthorizationResult,
  EffectivePermissions,
  PermissionSlug,
  RoleSlug,
  ResourceSlug,
  ActionSlug,
  ModuleSlug,
} from './AuthorizationEngine.ts';

export type {
  RoleRecord,
  PermissionRecord,
  ModuleRecord,
} from './AuthorizationEngine.ts';

export type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleWithPermissions,
} from './RoleEngine.ts';
