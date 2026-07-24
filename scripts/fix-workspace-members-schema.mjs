import pg from 'pg';

const connectionString = 'postgresql://cyzor_control_user:8e8be4c12906a1c87619c3d1ac2ae37cf65b@72.60.247.117:5432/cyzor_control_db';
const pool = new pg.Pool({ connectionString, ssl: false });

try {
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT gen_random_uuid() NOT NULL;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS department text;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS team_name text;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS manager_uid text REFERENCES users(uid) ON DELETE SET NULL;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS status text DEFAULT 'Ativo';`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS career_level text DEFAULT 'Pleno';`);

  await pool.query(`ALTER TABLE workspace_members DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_unique;`);
  await pool.query(`DROP INDEX IF EXISTS workspace_members_workspace_id_unique;`);

  await pool.query(`CREATE INDEX IF NOT EXISTS ws_members_ws_user_idx ON workspace_members (workspace_id, user_uid);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS ws_members_user_idx ON workspace_members (user_uid);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS workspace_members_tenant_idx ON workspace_members (tenant_id);`);

  const columns = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspace_members'
    ORDER BY ordinal_position
  `);
  const indexes = await pool.query(`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'workspace_members';`);
  console.log('columns', JSON.stringify(columns.rows, null, 2));
  console.log('indexes', JSON.stringify(indexes.rows, null, 2));
} catch (error) {
  console.error('Schema update failed:', error);
  process.exit(1);
} finally {
  await pool.end();
}
