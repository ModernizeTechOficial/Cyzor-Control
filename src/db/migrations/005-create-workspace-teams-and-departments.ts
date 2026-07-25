import { registerMigration } from './runner';
import { sql } from 'drizzle-orm';

registerMigration({
  id: '005-create-workspace-teams-and-departments',
  name: 'Create workspace_teams and workspace_departments tables',
  description: 'Creates organizational team and department tables for workspace management',
  async up(db: any) {
    // WORKSPACE TEAMS
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "workspace_teams" (
        "id" serial PRIMARY KEY,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "workspace_id" integer NOT NULL REFERENCES "workspaces" ("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "description" text,
        "goal" text,
        "lead_uid" text REFERENCES "users" ("uid") ON DELETE SET NULL,
        "department" text,
        "health_score" integer DEFAULT 85,
        "career_hub_avg" real DEFAULT 80.0,
        "kpis" jsonb DEFAULT '[]',
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    // WORKSPACE DEPARTMENTS
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "workspace_departments" (
        "id" serial PRIMARY KEY,
        "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
        "workspace_id" integer NOT NULL REFERENCES "workspaces" ("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "description" text,
        "lead_uid" text REFERENCES "users" ("uid") ON DELETE SET NULL,
        "health_score" integer DEFAULT 85,
        "kpis" jsonb DEFAULT '[]',
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      )
    `);

    // Indexes for workspace_teams
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_teams_ws_idx" ON "workspace_teams" ("workspace_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_teams_tenant_idx" ON "workspace_teams" ("tenant_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_teams_lead_idx" ON "workspace_teams" ("lead_uid")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_teams_dept_idx" ON "workspace_teams" ("department")`);

    // Indexes for workspace_departments
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_dept_ws_idx" ON "workspace_departments" ("workspace_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_dept_tenant_idx" ON "workspace_departments" ("tenant_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_dept_lead_idx" ON "workspace_departments" ("lead_uid")`);
  },
});
