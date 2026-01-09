import { Pool } from 'pg';

const PUBLIC_DAYS = Number(process.env.RETENTION_PUBLIC_DAYS || 30);
const PRIVATE_DAYS = Number(process.env.RETENTION_PRIVATE_DAYS || 14);
const LOG_DAYS = Number(process.env.RETENTION_LOG_DAYS || 14);

export function startRetentionJob() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const intervalMs = 12 * 60 * 60 * 1000;

  const run = async () => {
    await pool.query(
      "DELETE FROM transcript_messages WHERE session_id IN (SELECT id FROM sessions WHERE type = 'public' AND created_at < NOW() - ($1 || ' days')::interval)",
      [PUBLIC_DAYS]
    );
    await pool.query(
      "DELETE FROM transcript_messages WHERE session_id IN (SELECT id FROM sessions WHERE type = 'private' AND created_at < NOW() - ($1 || ' days')::interval)",
      [PRIVATE_DAYS]
    );
    await pool.query(
      "DELETE FROM telemetry_events WHERE created_at < NOW() - ($1 || ' days')::interval",
      [LOG_DAYS]
    );
  };

  run().catch((error) => console.error('retention job failed', error));
  setInterval(() => {
    run().catch((error) => console.error('retention job failed', error));
  }, intervalMs);
}
