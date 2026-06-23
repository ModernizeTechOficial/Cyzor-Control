import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from './schema.ts';

async function main() {
  console.log('Running migrations...');
  
  const isSocket = process.env.SQL_HOST?.startsWith('/');
  const connection = await mysql.createConnection({
    [isSocket ? 'socketPath' : 'host']: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME || process.env.SQL_DATABASE,
    port: Number(process.env.SQL_PORT || 3306),
    multipleStatements: true,
  });

  const db = drizzle(connection, { schema, mode: 'default' });

  await migrate(db, { migrationsFolder: './drizzle' });

  await connection.end();
  
  console.log('Migrations completed!');
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});
