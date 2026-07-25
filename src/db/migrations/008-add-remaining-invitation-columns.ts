import { registerMigration } from './runner';
import { sql } from 'drizzle-orm';

registerMigration({
  id: '008-add-remaining-invitation-columns',
  name: 'Add remaining missing columns to workspace_invitations',
  description: 'Adds custom_message, usage_limit, and used_count columns to workspace_invitations',
  async up(db: any) {
    await db.execute(sql`
      ALTER TABLE "workspace_invitations"
      ADD COLUMN IF NOT EXISTS "custom_message" text,
      ADD COLUMN IF NOT EXISTS "usage_limit" integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "used_count" integer DEFAULT 0
    `);
  },
});
