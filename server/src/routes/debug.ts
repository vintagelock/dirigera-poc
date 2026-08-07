import { Router } from 'express';
import { getLogHistory, subscribeToLogs } from '../services/logBus.js';

export const debugRouter = Router();

// Deliberately not gated by requirePaired: pairing/mDNS problems are
// exactly the kind of thing this stream needs to be able to show.
debugRouter.get('/logs', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const cleanup = () => {
    clearInterval(heartbeat);
    unsubscribe();
  };

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

  // Replay recent history so a freshly-opened debug window isn't empty.
  for (const entry of getLogHistory()) {
    safeWrite(`data: ${JSON.stringify(entry)}\n\n`);
  }

  const unsubscribe = subscribeToLogs((entry) => {
    safeWrite(`data: ${JSON.stringify(entry)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    safeWrite(': ping\n\n');
  }, 25000);

  req.on('close', cleanup);
  res.on('error', cleanup);
});
