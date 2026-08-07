import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import { PORT } from './env.js';
import { initClientFromStoredToken, UnpairedError } from './dirigeraClient.js';
import { HubTimeoutError } from './withHubTimeout.js';
import { authRouter } from './routes/auth.js';
import { devicesRouter } from './routes/devices.js';
import { roomsRouter } from './routes/rooms.js';
import { scenesRouter } from './routes/scenes.js';
import { eventsRouter } from './routes/events.js';
import { debugRouter } from './routes/debug.js';
import { installConsoleLogBridge } from './services/consoleLogBridge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

installConsoleLogBridge();

// Defense-in-depth: an unhandled error thrown inside an async callback that
// isn't part of a request (e.g. from the hub's WebSocket event stream) would
// otherwise crash the whole process with no useful trace. Log and stay up.
//
// One specific case is expected and benign: reconnecting-websocket calls the
// underlying `ws` socket's close() when a connection *attempt* to the hub
// times out, and that throws synchronously if the socket hadn't finished
// connecting yet. It self-recovers (reconnecting-websocket retries on its
// own), so log it quietly instead of as an alarming crash-looking error.
function isBenignHubReconnectError(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.message === 'WebSocket was closed before the connection was established' &&
    err.stack?.includes('reconnecting-websocket') === true
  );
}

process.on('uncaughtException', (err) => {
  if (isBenignHubReconnectError(err)) {
    console.warn('Hub connection attempt timed out, retrying...');
    return;
  }
  console.error('Uncaught exception (server staying up):', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (server staying up):', reason);
});

// If the process exits for ANY reason (node --watch restart, an OS signal,
// a fatal error our handlers above couldn't intercept), print why. Without
// this, an exit just looks like the log silently stops and restarts.
process.on('exit', (code) => {
  console.log(`--- process exiting (code ${code}) ---`);
});
for (const signal of ['SIGINT', 'SIGTERM', 'SIGBREAK'] as const) {
  process.on(signal, () => {
    console.log(`Received ${signal}`);
    process.exit(0);
  });
}

async function main(): Promise<void> {
  await initClientFromStoredToken();

  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.debug(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });

  app.use('/api/debug', debugRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/devices', devicesRouter);
  app.use('/api/rooms', roomsRouter);
  app.use('/api/scenes', scenesRouter);
  app.use('/api/events', eventsRouter);

  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('Client build not found. Run "npm run build" or use the Vite dev server on port 5173.');
      }
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    if (err instanceof UnpairedError) {
      res.status(409).json({ error: 'unpaired' });
      return;
    }
    if (err instanceof HubTimeoutError) {
      res.status(504).json({ error: 'hub_timeout', message: err.message });
      return;
    }
    res.status(500).json({
      error: 'internal_error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
