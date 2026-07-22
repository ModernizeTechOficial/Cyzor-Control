import pg from 'pg';

const connectionString = 'postgresql://cyzor_control_user:8e8be4c12906a1c87619c3d1ac2ae37cf65b@72.60.247.117:5432/cyzor_control_db';
const pool = new pg.Pool({ connectionString, ssl: false });

const config = {
  enabled: true,
  host: 'mail.cyzor.com.br',
  port: 587,
  user: 'noreply@control.cyzor.com.br',
  pass: '!A@ndr0m3d4',
  from: '"Cyzor Control" <noreply@control.cyzor.com.br>',
  secure: true,
};

try {
  const result = await pool.query(
    'INSERT INTO platform_settings(key, value, updated_at) VALUES($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW() RETURNING *',
    ['smtp_config', JSON.stringify(config)]
  );
  console.log('Seed result:', result.rows[0]);
} catch (error) {
  console.error('Seed error:', error);
} finally {
  await pool.end();
}
