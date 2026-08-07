import { useEffect, useRef, useState } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  message: string;
}

const MAX_ENTRIES = 1000;

export function useDebugLogs(enabled: boolean) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const seenIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const source = new EventSource('/api/debug/logs');
    source.onopen = () => setStatus('open');
    source.onerror = () => setStatus('closed');

    source.onmessage = (message: MessageEvent<string>) => {
      let entry: LogEntry;
      try {
        entry = JSON.parse(message.data);
      } catch {
        return;
      }
      if (seenIds.current.has(entry.id)) return;
      seenIds.current.add(entry.id);

      setEntries((old) => {
        const next = [...old, entry];
        if (next.length > MAX_ENTRIES) next.splice(0, next.length - MAX_ENTRIES);
        return next;
      });
    };

    return () => {
      source.close();
      setStatus('closed');
    };
  }, [enabled]);

  const clear = () => {
    seenIds.current.clear();
    setEntries([]);
  };

  return { entries, status, clear };
}
