import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

export const createPool = () => {
  const connectionString = process.env.DB_URL || process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({
      connectionString: connectionString,
      connectionTimeoutMillis: 15000,
    });
  }
  return new Pool({
    host: process.env.PGHOST || process.env.DB_HOST,
    user: process.env.PGUSER || process.env.DB_USERNAME,
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
    database: process.env.PGDATABASE || process.env.DB_DATABASE,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
