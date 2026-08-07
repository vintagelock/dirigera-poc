import { useEffect, useRef, useState } from 'react';
import { useDebugLogs, type LogLevel } from '../hooks/useDebugLogs';

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: 'text-text-muted',
  info: 'text-text',
  warn: 'text-accent',
  error: 'text-danger',
};

export function Debug() {
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(new Set(LEVELS));
  const { entries, status, clear } = useDebugLogs(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const filtered = entries.filter((entry) => activeLevels.has(entry.level));

  useEffect(() => {
    if (!stickToBottom.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [filtered.length]);

  const toggleLevel = (level: LogLevel) => {
    setActiveLevels((old) => {
      const next = new Set(old);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 text-xs ${status === 'open' ? 'text-success' : 'text-text-muted'}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status === 'open' ? 'bg-success' : 'bg-text-muted'} ${status === 'open' ? 'animate-pulse' : ''}`}
            />
            {status === 'open' ?
              'Live'
            : status === 'connecting' ?
              'Connecting'
            : 'Disconnected'}
          </span>
          <div className="flex items-center gap-1">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => toggleLevel(level)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  activeLevels.has(level) ?
                    'border-accent/50 bg-accent/15 text-accent'
                  : 'border-border text-text-muted'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-text"
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
        }}
        className="flex-1 overflow-y-auto rounded-2xl border border-border bg-surface-card/60 px-4 py-3 font-mono text-xs leading-relaxed"
      >
        {filtered.length === 0 ?
          <p className="text-text-muted">No log entries yet.</p>
        : filtered.map((entry) => (
            <div key={entry.id} className="flex gap-2 whitespace-pre-wrap">
              <span className="shrink-0 text-text-muted">{entry.time.slice(11, 19)}</span>
              <span className={`w-12 shrink-0 uppercase ${LEVEL_COLOR[entry.level]}`}>{entry.level}</span>
              <span className={LEVEL_COLOR[entry.level]}>{entry.message}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
