// ============================================================================
// BUSINESS OPERATING SYSTEM (BOS) - Core Platform
// ============================================================================
// This module provides the foundational services for the CYZOR Control platform.
// All modules must depend on this core, never on each other directly.

export { authorizationEngine, AuthorizationEngine } from './authorization/AuthorizationEngine.js';
export { roleEngine, RoleEngine } from './authorization/RoleEngine.js';
export { policyEngine, PolicyEngine } from './authorization/PolicyEngine.js';
export { moduleRegistry, ModuleRegistry } from './module-registry/ModuleRegistry.js';
export { featureFlagService, FeatureFlagService } from './feature-flags/FeatureFlagService.js';
export { auditService, AuditService } from './audit/AuditService.js';

export type {
  AuthorizationContext,
  AuthorizationResult,
  EffectivePermissions,
  PermissionSlug,
  RoleSlug,
  ResourceSlug,
  ActionSlug,
  ModuleSlug,
} from './authorization/AuthorizationEngine.js';

export type {
  RoleRecord,
  PermissionRecord,
  ModuleRecord,
  CreateRoleInput,
  UpdateRoleInput,
  RoleWithPermissions,
} from './authorization/RoleEngine.js';

export type {
  ModuleManifest,
  RegisteredModule,
  ModuleResourceDefinition,
  ModuleActionDefinition,
  ModuleEvent,
  ModuleAutomation,
  ModuleAITool,
  ModuleDashboardConfig,
} from './module-registry/ModuleRegistry.js';

export type {
  FeatureFlag,
  CreateFeatureFlagInput,
  FeatureFlagKey,
  FeatureFlagScope,
} from './feature-flags/FeatureFlagService.js';

export type {
  AuditEntry,
  PermissionAuditEntry,
  CreateAuditInput,
  AuditAction,
  AuditTargetType,
} from './audit/AuditService.js';
