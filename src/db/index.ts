import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || 'database/database.sqlite';
const dbDir = path.dirname(dbPath);

try {
  if (!fs.existsSync(dbDir)) {
    console.log(`[Database] Criando diretório do banco em: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (error) {
  console.error('[Database Error] Falha ao criar o diretório do banco de dados:', error);
  process.exit(1);
}

console.log(`[Database] Inicializando banco SQLite local em: ${dbPath}`);

let sqlite: Database.Database;
try {
  sqlite = new Database(dbPath, { fileMustExist: false });
  // WAL mode for performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('synchronous = NORMAL');
} catch (error: any) {
  console.error('[Database Error] Arquivo do banco de dados inexistente, corrompido ou sem permissão de leitura/escrita:', error.message);
  process.exit(1);
}

export const db = drizzle(sqlite, { schema });

try {
  console.log('[Database] Verificando e aplicando migrações (tabelas e índices)...');
  migrate(db, { migrationsFolder: 'drizzle' });
  console.log('[Database] Migrações concluídas com sucesso. O banco está pronto!');
} catch (error: any) {
  console.error('[Database Error] Falha ao realizar migração automática. Pode haver tabela inexistente ou esquema inconsistente:', error.message);
}



