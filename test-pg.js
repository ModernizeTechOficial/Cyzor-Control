const pg = require('pg');
const pool = new pg.Pool({ connectionString: "postgresql://cyzor_control_user:8e8be4c12906a1c87619c3d1ac2ae37cf65b@72.60.247.117:5432/cyzor_control_db" });
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  console.log('Connected to', client.host, client.port);
  release();
});
