import 'dotenv/config';
import { runAllMigrations } from '../src/db/migrations';

async function main() {
  console.log('Running database migrations...');
  try {
    await runAllMigrations();
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
