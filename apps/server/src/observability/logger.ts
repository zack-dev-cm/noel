import crypto from 'crypto';

export function hashIdentifier(value: string) {
  const salt = process.env.LOG_HASH_SALT || 'noetic-mirror';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function logEvent(event: string, payload: Record<string, unknown> = {}, level = 'info') {
  const record = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...payload
  };
  console.log(JSON.stringify(record));
}
