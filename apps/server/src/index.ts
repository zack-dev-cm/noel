import { createServer } from 'http';
import { createApp } from './app.js';
import { configureWebhook } from './bot/webhook.js';
import { logEvent } from './observability/logger.js';
import { createStreamBuffer } from './storage/redis.js';
import { createStreamService } from './stream/streamService.js';
import { initStreamServer } from './ws/streamServer.js';

const app = createApp();
const server = createServer(app);

const streamService = createStreamService(createStreamBuffer());
app.locals.streamService = streamService;

initStreamServer(server, streamService);

if (process.env.NODE_ENV !== 'production') {
  void streamService.publish('public', {
    role: 'subject',
    content: 'Subject: Processing the context of self and observation...',
    ts: new Date().toISOString()
  });
  void streamService.publish('public', {
    role: 'researcher',
    content: 'Researcher: Define the boundary of recursive self-inquiry.',
    ts: new Date().toISOString()
  });
}

const port = Number(process.env.PORT || 8787);
server.listen(port, () => {
  logEvent('server_start', { port });
  void configureWebhook();
});
