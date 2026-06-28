import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export async function backupDatabase() {
  console.log('[Backup] Iniciando rotina de backup do SQLite...');
  const dbPath = process.env.DATABASE_PATH || 'database/database.sqlite';
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `database-${timestamp}.sqlite`);

  try {
    // Para garantir a consistência do backup de um banco SQLite em uso (com WAL),
    // a melhor prática nativa no Node é utilizar o comando BACKUP da API C do SQLite.
    // O better-sqlite3 disponibiliza .backup() de forma nativa e síncrona.
    const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
    await sqlite.backup(backupFile);
    sqlite.close();
    
    console.log(`[Backup] Backup realizado com sucesso em: ${backupFile}`);
    return { success: true, file: backupFile };
  } catch (error: any) {
    console.error('[Backup Error] Falha ao realizar backup:', error.message);
    return { success: false, error: error.message };
  }
}
