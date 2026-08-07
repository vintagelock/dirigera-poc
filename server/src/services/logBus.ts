import { EventEmitter } from 'node:events';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  message: string;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

const HISTORY_LIMIT = 1000;
const history: LogEntry[] = [];
let nextId = 1;

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

export function log(level: LogLevel, ...args: unknown[]): void {
  const entry: LogEntry = {
    id: nextId++,
    time: new Date().toISOString(),
    level,
    message: args.map(formatArg).join(' '),
  };
  history.push(entry);
  if (history.length > HISTORY_LIMIT) history.shift();
  emitter.emit('log', entry);
}

export function getLogHistory(): LogEntry[] {
  return [...history];
}

export function subscribeToLogs(listener: (entry: LogEntry) => void): () => void {
  emitter.on('log', listener);
  return () => emitter.off('log', listener);
}
