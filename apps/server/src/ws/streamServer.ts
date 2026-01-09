import type { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { logEvent } from '../observability/logger.js';
import type { StreamService } from '../stream/streamService.js';

export function initStreamServer(server: HttpServer, streamService: StreamService) {
  const wss = new WebSocketServer({ server, path: '/ws/stream' });

  wss.on('connection', async (socket, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const sessionId = url.searchParams.get('session_id') || 'public';
    const lastSeq = Number(url.searchParams.get('last_seq') || 0);

    const replay = await streamService.replay(sessionId, lastSeq);
    replay.forEach((event) => socket.send(JSON.stringify(event)));

    const unsubscribe = streamService.subscribe(sessionId, (event) => {
      socket.send(JSON.stringify(event));
    });

    socket.on('close', () => {
      unsubscribe();
      logEvent('ws_disconnect', { session_id: sessionId });
    });
  });
}
