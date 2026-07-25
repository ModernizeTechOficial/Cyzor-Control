import { registerMigration } from './runner';
import { sql } from 'drizzle-orm';

registerMigration({
  id: '006-add-project-scoped-invitations',
  name: 'Add project-scoped invitations and user project restrictions',
  description: 'Adds projectId to workspace_invitations and creates user_project_restrictions table for invited user access control',
  async up(db: any) {
    // Add projectId to workspace_invitations (nullable for backward compatibility)
    await db.execute(sql`
      ALTER TABLE "workspace_invitations"
      ADD COLUMN IF NOT EXISTS "project_id" integer REFERENCES "projects" ("id") ON DELETE SET NULL
    `);

    // Add index for project-scoped invitation lookups
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_inv_project_idx" ON "workspace_invitations" ("project_id")`);

    // Create user_project_restrictions table
    // This table tracks users who were invited with project-scoped access
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_project_restrictions" (
        "id" serial PRIMARY KEY,
        "user_id" text NOT NULL REFERENCES "users" ("uid") ON DELETE CASCADE,
        "workspace_id" integer NOT NULL REFERENCES "workspaces" ("id") ON DELETE CASCADE,
        "tenant_id" uuid NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE,
        "project_id" integer NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE,
        "invitation_id" integer REFERENCES "workspace_invitations" ("id") ON DELETE SET NULL,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    // Indexes for fast lookups
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "upr_user_idx" ON "user_project_restrictions" ("user_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "upr_workspace_idx" ON "user_project_restrictions" ("workspace_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "upr_project_idx" ON "user_project_restrictions" ("project_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "upr_user_project_idx" ON "user_project_restrictions" ("user_id", "project_id")`);
  },
});
