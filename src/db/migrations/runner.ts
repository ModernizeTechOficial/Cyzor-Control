import { db } from '../index.ts';
import { sql } from 'drizzle-orm';

// ============================================================================
// MIGRATIONS RUNNER - Idempotent database migrations
// ============================================================================

export interface Migration {
  id: string;
  name: string;
  description: string;
  up: (db: any) => Promise<void>;
  down?: (db: any) => Promise<void>;
}

const migrations: Migration[] = [];

export function registerMigration(migration: Migration) {
  migrations.push(migration);
}

export async function ensureSchemaMigrationsTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        applied_at TIMESTAMP DEFAULT NOW(),
        checksum VARCHAR(64)
      )
    `);
  } catch (error) {
    console.warn('[Migrations] Could not ensure schema_migrations table:', error);
  }
}

function getResultRows<T>(result: any): T[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.rows)) return result.rows;
  if (Array.isArray(result.result)) return result.result;
  if (Array.isArray(result.rows?.rows)) return result.rows.rows;
  if (Array.isArray(result.recordset)) return result.recordset;
  return [];
}

export async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await db.execute(sql`SELECT id FROM schema_migrations ORDER BY id`);
    const rows = getResultRows<{ id: string }>(result);
    return rows.map((row) => row.id);
  } catch (error) {
    console.warn('[Migrations] Could not get applied migrations:', error);
    return [];
  }
}

export async function applyMigration(migration: Migration) {
  console.log(`[Migrations] Applying: ${migration.id} - ${migration.name}`);
  try {
    await db.transaction(async (tx: any) => {
      await migration.up(tx);
      await tx.execute(sql`
        INSERT INTO schema_migrations (id, name, description, checksum)
        VALUES (${migration.id}, ${migration.name}, ${migration.description}, '')
        ON CONFLICT (id) DO NOTHING
      `);
    });
    console.log(`[Migrations] ✓ Applied: ${migration.id}`);
  } catch (error) {
    console.error(`[Migrations] ✗ Failed to apply ${migration.id}:`, error);
    throw error;
  }
}

export async function runPendingMigrations() {
  console.log('[Migrations] Checking for pending migrations...');
  
  await ensureSchemaMigrationsTable();
  const applied = await getAppliedMigrations();
  const pending = migrations.filter((m) => !applied.includes(m.id));

  if (pending.length === 0) {
    console.log('[Migrations] No pending migrations.');
    return;
  }

  console.log(`[Migrations] Found ${pending.length} pending migration(s).`);
  
  for (const migration of pending) {
    await applyMigration(migration);
  }

  console.log(`[Migrations] ✓ Applied ${pending.length} migration(s).`);
}

export async function runMigrations() {
  try {
    await ensureSchemaMigrationsTable();
    const applied = await getAppliedMigrations();
    const pending = migrations.filter((m) => !applied.includes(m.id));

    if (pending.length === 0) {
      console.log('[Migrations] No pending migrations.');
      return;
    }

    console.log(`[Migrations] Found ${pending.length} pending migration(s).`);

    for (const migration of pending) {
      await applyMigration(migration);
    }

    console.log(`[Migrations] ✓ Applied ${pending.length} migration(s).`);
  } catch (error) {
    console.error('[Migrations] Error running migrations:', error);
    throw error;
  }
}

export { migrations };
