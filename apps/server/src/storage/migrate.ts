import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

export async function applyMigrations() {
  if (!process.env.DATABASE_URL) {
    return;
  }
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.resolve(__dirname, '../../../../migrations');
  const entries = await fs.readdir(migrationsDir);
  const files = entries.filter((entry) => entry.endsWith('.sql')).sort();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
  }
}
