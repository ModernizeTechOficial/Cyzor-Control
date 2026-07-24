import { registerMigration } from './runner';
import { sql } from 'drizzle-orm';

registerMigration({
  id: '004-create-assignments-tables',
  name: 'Create assignments and assignment_templates tables',
  description: 'Adds assignment support for BOS resource permissions and team assignments',
  async up(db: any) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "assignment_templates" (
        "id" serial PRIMARY KEY,
        "workspace_id" integer NOT NULL,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "resource_type" text NOT NULL,
        "resource_id" integer NOT NULL,
        "role" text,
        "permission_set" jsonb DEFAULT '[]',
        "created_by" text,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "assignments" (
        "id" serial PRIMARY KEY,
        "workspace_id" integer NOT NULL,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "resource_type" text NOT NULL,
        "resource_id" integer NOT NULL,
        "member_id" integer NOT NULL,
        "role" text,
        "permission_set" jsonb DEFAULT '[]',
        "visibility_scope" text DEFAULT 'Workspace',
        "status" text DEFAULT 'ACTIVE',
        "assigned_by" text,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "assignment_templates_ws_idx" ON "assignment_templates" ("workspace_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "assignments_ws_idx" ON "assignments" ("workspace_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "assignments_resource_idx" ON "assignments" ("resource_type", "resource_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "assignments_member_idx" ON "assignments" ("member_id")`);
  },
});
