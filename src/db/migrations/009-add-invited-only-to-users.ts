import { registerMigration } from './runner';
import { sql } from 'drizzle-orm';

registerMigration({
  id: '009-add-invited-only-to-users',
  name: 'Add invited_only flag to users',
  description: 'Adds invited_only boolean to track users who joined via invitation and should not see personal workspace',
  async up(db: any) {
    await db.execute(sql`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "invited_only" boolean DEFAULT false
    `);
  },
});
