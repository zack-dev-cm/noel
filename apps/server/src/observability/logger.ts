import crypto from 'crypto';

export function hashIdentifier(value: string) {
  const salt = process.env.LOG_HASH_SALT || 'noetic-mirror';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

const LEVELS: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function resolveLogLevel(): number {
  const level = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return LEVELS[level] ?? LEVELS.info;
}

export function logEvent(event: string, payload: Record<string, unknown> = {}, level = 'info') {
  const eventLevel = LEVELS[level] ?? LEVELS.info;
  if (eventLevel < resolveLogLevel()) {
    return;
  }
  const record = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...payload
  };
  console.log(JSON.stringify(record));
}
