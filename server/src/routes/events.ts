import { Router } from 'express';
import { requirePaired } from '../middleware/requirePaired.js';
import { subscribe } from '../services/eventBroadcaster.js';

export const eventsRouter = Router();
eventsRouter.use(requirePaired);

eventsRouter.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const cleanup = () => {
    clearInterval(heartbeat);
    unsubscribe();
  };

  // A stale/destroyed response socket (dropped connection, HMR reload, tab
  // close racing with an in-flight hub event) can make res.write() throw
  // synchronously. That throw happens inside the WebSocket message handler's
  // call stack with nothing above it to catch it, which crashes the whole
  // server process. Guard every write so a dead SSE client just gets cleaned
  // up instead of taking the server down with it.
  const safeWrite = (chunk: string) => {
    if (res.writableEnded || res.destroyed) {
      cleanup();
      return;
    }
    try {
      res.write(chunk);
    } catch {
      cleanup();
    }
  };

  safeWrite('retry: 2000\n\n');

  const unsubscribe = subscribe((event) => {
    safeWrite(`data: ${JSON.stringify(event)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    safeWrite(': ping\n\n');
  }, 25000);

  req.on('close', cleanup);
  res.on('error', cleanup);
});
