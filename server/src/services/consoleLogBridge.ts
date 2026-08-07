import { log, type LogLevel } from './logBus.js';

// Every existing console.* call site (pairing, mDNS discovery, hub timeout
// warnings, uncaught-exception logging, etc.) already carries the exact
// information a debug window needs. Rather than duplicating every message
// into two places, tee console output into the log bus once, here, so the
// debug window sees the same thing the terminal does.
export function installConsoleLogBridge(): void {
  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };

  const wrap = (level: LogLevel, fn: (...args: unknown[]) => void) => {
    return (...args: unknown[]) => {
      // A broken stdout/stderr pipe makes the original console call throw.
      // If that's allowed to propagate, it re-triggers 'uncaughtException',
      // whose handler calls console.error again, which throws again —
      // an infinite synchronous loop. Swallow write failures here instead.
      try {
        fn(...args);
      } catch {
        // Nothing more we can do about a broken output stream.
      }
      log(level, ...args);
    };
  };

  console.log = wrap('info', original.log);
  console.info = wrap('info', original.info);
  console.warn = wrap('warn', original.warn);
  console.error = wrap('error', original.error);
  console.debug = wrap('debug', original.debug);
}
