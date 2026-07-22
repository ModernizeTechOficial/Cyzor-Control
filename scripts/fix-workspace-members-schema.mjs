import pg from 'pg';

const connectionString = 'postgresql://cyzor_control_user:8e8be4c12906a1c87619c3d1ac2ae37cf65b@72.60.247.117:5432/cyzor_control_db';
const pool = new pg.Pool({ connectionString, ssl: false });

try {
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS department text;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS team_name text;`);
  await pool.query(`ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;`);

  const result = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspace_members'
    ORDER BY ordinal_position
  `);
  console.log(JSON.stringify(result.rows, null, 2));
} catch (error) {
  console.error('Schema update failed:', error);
  process.exit(1);
} finally {
  await pool.end();
}
