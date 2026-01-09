import { createServer } from 'http';
import { logEvent } from './observability/logger.js';
import { enableTracing } from './observability/tracing.js';
import { runResearcherSession } from './runner.js';

const sessionId = process.env.SESSION_ID || 'public';
const initialPrompt =
  process.env.INITIAL_PROMPT || 'Begin the introspection protocol. Analyze your own dataset boundaries.';
const tickSeconds = Math.max(10, Number(process.env.WORKER_TICK_SECONDS || 30));
const httpEnabled = process.env.WORKER_HTTP_ENABLED !== 'false';
const port = Number(process.env.PORT || 8080);

enableTracing();
logEvent('worker_start', { session_id: sessionId, tick_seconds: tickSeconds });

let running = false;

const runOnce = async () => {
  if (running) {
    return;
  }
  running = true;
  try {
    await runResearcherSession({ sessionId, initialPrompt });
  } catch (error) {
    logEvent('worker_failed', { error: String(error), session_id: sessionId }, 'error');
  } finally {
    running = false;
  }
};

if (httpEnabled) {
  const server = createServer((req, res) => {
    if (req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  });

  server.listen(port, () => {
    logEvent('worker_listening', { port });
  });
} else {
  logEvent('worker_http_disabled', { port });
}

runOnce();
setInterval(runOnce, tickSeconds * 1000);
