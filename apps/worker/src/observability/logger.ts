export function logEvent(event: string, payload: Record<string, unknown> = {}, level = 'info') {
  const record = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...payload
  };
  console.log(JSON.stringify(record));
}
