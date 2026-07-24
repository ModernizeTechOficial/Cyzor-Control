import { registerMigration, runMigrations } from './runner';
import { sql } from 'drizzle-orm';
import './004-create-assignments-tables.ts';

// ============================================================================
// MIGRATION: 001-add-onboarding-fields
// ============================================================================
// Adds missing columns for onboarding and BOS features
// ============================================================================

registerMigration({
  id: '001-add-onboarding-fields',
  name: 'Add onboarding fields',
  description: 'Adds onboarding_completed to workspace_members and business fields to workspaces',
  async up(db: any) {
    // workspace_members.onboarding_completed
    await db.execute(sql`
      ALTER TABLE "workspace_members"
      ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean NOT NULL DEFAULT false
    `);

    // workspaces.business_type / stage / completed_at
    await db.execute(sql`
      ALTER TABLE "workspaces"
      ADD COLUMN IF NOT EXISTS "business_type" text,
      ADD COLUMN IF NOT EXISTS "stage" text,
      ADD COLUMN IF NOT EXISTS "completed_at" text
    `);
  },
});

// ============================================================================
// MIGRATION: 002-create-bos-tables
// ============================================================================
// Creates BOS authorization tables if they don't exist
// ============================================================================

registerMigration({
  id: '002-create-bos-tables',
  name: 'Create BOS tables',
  description: 'Creates roles, permissions, role_permissions, modules, resources, actions, feature_flags, permission_audit_log',
  async up(db: any) {
    // roles
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "description" text,
        "color" text DEFAULT '#64748B',
        "icon" text DEFAULT 'user',
        "is_system" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "parent_role_slug" text,
        "priority" integer DEFAULT 0,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "workspace_id" integer,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "roles_slug_idx" ON "roles" ("slug")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "roles_tenant_idx" ON "roles" ("tenant_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "roles_parent_idx" ON "roles" ("parent_role_slug")`);

    // permissions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL UNIQUE,
        "module" text NOT NULL,
        "resource" text NOT NULL,
        "action" text NOT NULL,
        "description" text,
        "is_system" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "permissions_slug_idx" ON "permissions" ("slug")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "permissions_module_idx" ON "permissions" ("module")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "permissions_resource_idx" ON "permissions" ("resource")`);

    // role_permissions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "id" serial PRIMARY KEY,
        "role_slug" text NOT NULL,
        "permission_slug" text NOT NULL,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "workspace_id" integer,
        "is_inherited" boolean DEFAULT false,
        "created_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "role_permissions_role_idx" ON "role_permissions" ("role_slug", "permission_slug")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "role_permissions_tenant_idx" ON "role_permissions" ("tenant_id")`);

    // modules
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "modules" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "description" text,
        "icon" text DEFAULT 'box',
        "category" text DEFAULT 'general',
        "version" text DEFAULT '1.0.0',
        "status" text DEFAULT 'active',
        "is_system" boolean DEFAULT false,
        "dependencies" jsonb DEFAULT '[]',
        "manifest" jsonb DEFAULT '{}',
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "modules_slug_idx" ON "modules" ("slug")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "modules_tenant_idx" ON "modules" ("tenant_id")`);

    // resources
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "resources" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL,
        "module_slug" text NOT NULL,
        "name" text NOT NULL,
        "table_name" text,
        "is_active" boolean DEFAULT true,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "resources_slug_idx" ON "resources" ("slug")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "resources_module_idx" ON "resources" ("module_slug")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "resources_tenant_idx" ON "resources" ("tenant_id")`);

    // actions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "actions" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "description" text,
        "is_system" boolean DEFAULT true,
        "created_at" timestamp DEFAULT NOW()
      )
    `);

    // feature_flags
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "feature_flags" (
        "id" serial PRIMARY KEY,
        "key" text NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "is_enabled" boolean DEFAULT false,
        "scope" text DEFAULT 'workspace',
        "tenant_id" uuid,
        "workspace_id" integer,
        "metadata" jsonb DEFAULT '{}',
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "feature_flags_key_scope_idx" ON "feature_flags" ("key", "scope")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "feature_flags_tenant_idx" ON "feature_flags" ("tenant_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "feature_flags_workspace_idx" ON "feature_flags" ("workspace_id")`);

    // permission_audit_log
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "permission_audit_log" (
        "id" serial PRIMARY KEY,
        "tenant_id" uuid NOT NULL,
        "workspace_id" integer,
        "actor_uid" text NOT NULL,
        "action" text NOT NULL,
        "target_type" text NOT NULL,
        "target_id" text NOT NULL,
        "old_value" jsonb,
        "new_value" jsonb,
        "ip_address" text,
        "user_agent" text,
        "created_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "perm_audit_tenant_idx" ON "permission_audit_log" ("tenant_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "perm_audit_target_idx" ON "permission_audit_log" ("target_type", "target_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "perm_audit_actor_idx" ON "permission_audit_log" ("actor_uid")`);
  },
});

// ============================================================================
// MIGRATION: 003-add-workspace-members-xp-career-level
// ============================================================================
// Adds xp and career_level columns to workspace_members to align with schema.ts.
// ============================================================================
registerMigration({
  id: '003-add-workspace-members-xp-career-level',
  name: 'Add workspace_members xp and career_level',
  description: 'Adds xp and career_level columns to workspace_members for onboarding and BOS compatibility',
  async up(db: any) {
    await db.execute(sql`
      ALTER TABLE "workspace_members"
      ADD COLUMN IF NOT EXISTS "xp" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "career_level" text NOT NULL DEFAULT 'Pleno'
    `);
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export async function runAllMigrations() {
  console.log('[Migrations] Starting migration runner...');
  await runMigrations();
  console.log('[Migrations] Migration runner completed.');
}

const runMigrationsDirectly = process.argv[1]?.endsWith('src/db/migrations/index.ts') || process.argv[1]?.endsWith('src\\db\\migrations\\index.ts');

if (runMigrationsDirectly) {
  runAllMigrations()
    .then(() => {
      console.log('[Migrations] Completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migrations] Failed:', error);
      process.exit(1);
    });
}
