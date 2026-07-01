import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;
  if (url) {
    if (url.startsWith("DATABASE_URL=")) {
      url = url.substring("DATABASE_URL=".length);
    }
    return url;
  }
  return "postgresql://cyzor_control_user:8e8be4c12906a1c87619c3d1ac2ae37cf65b@72.60.247.117:5432/cyzor_control_db";
}

const connectionString = getDatabaseUrl();

const maskedUrl = connectionString.includes('@') 
  ? connectionString.replace(/:([^:@]+)@/, ':******@') 
  : connectionString;

console.log(`[Database] Inicializando banco PostgreSQL em: ${maskedUrl}`);

let pool: pg.Pool;
try {
  pool = new pg.Pool({
    connectionString,
    ssl: false
  });
} catch (error: any) {
  console.error('[Database Error] Falha ao criar Pool de conexão PostgreSQL:', error.message);
  process.exit(1);
}

export const db = drizzle(pool, { schema });

// Graceful shutdown
function closeDatabase() {
  console.log('[Database] Fechando pool de conexões PostgreSQL...');
  if (pool) {
    pool.end()
      .then(() => {
        console.log('[Database] Conexões do pool encerradas com sucesso.');
        process.exit(0);
      })
      .catch((err) => {
        console.error('[Database] Erro ao encerrar o pool de conexões:', err);
        process.exit(1);
      });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

process.on('uncaughtException', (err) => {
  console.error('[Database Error] Uncaught Exception:', err);
  closeDatabase();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Database Error] Unhandled Rejection at:', promise, 'reason:', reason);
  closeDatabase();
});

