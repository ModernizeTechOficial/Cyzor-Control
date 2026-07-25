import { registerMigration } from './runner';
import { sql } from 'drizzle-orm';

registerMigration({
  id: '007-add-missing-invitation-columns',
  name: 'Add missing manager_uid column to workspace_invitations',
  description: 'Adds manager_uid column to workspace_invitations to align with schema.ts',
  async up(db: any) {
    await db.execute(sql`
      ALTER TABLE "workspace_invitations"
      ADD COLUMN IF NOT EXISTS "manager_uid" text REFERENCES "users" ("uid") ON DELETE SET NULL
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "ws_inv_manager_idx" ON "workspace_invitations" ("manager_uid")`);
  },
});
