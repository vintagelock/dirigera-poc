import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { usePair } from '../api/mutations';

const COUNTDOWN_SECONDS = 60;

export function Setup() {
  const { mutate, isPending, isError, isSuccess, error } = usePair();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isPending) return;
    setSecondsLeft(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPending]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface-card/80 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Radio className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold">Connect to your Dirigera hub</h1>
        <p className="mt-2 text-sm text-text-muted">
          Make sure this device is on the same network as your hub, then start pairing and press the action button on
          the hub within 60 seconds.
        </p>

        {isPending ?
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-accent/30 border-t-accent text-lg font-semibold">
              {secondsLeft}
            </div>
            <p className="text-sm text-text-muted">Press the action button on your Dirigera hub now…</p>
          </div>
        : <button
            type="button"
            onClick={() => mutate()}
            className="mt-8 w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Start pairing
          </button>
        }

        {isError && (
          <p className="mt-4 text-sm text-danger">
            {error instanceof Error ? error.message : 'Pairing failed. Please try again.'}
          </p>
        )}

        {isSuccess && <p className="mt-4 text-sm text-success">Paired! Loading your home…</p>}

        <p className="mt-6 text-xs text-text-muted">
          Can't find your hub automatically? Set{' '}
          <code className="rounded bg-surface-raised px-1 py-0.5">DIRIGERA_HUB_IP</code> in{' '}
          <code className="rounded bg-surface-raised px-1 py-0.5">server/.env</code> and restart the server.
        </p>
      </div>
    </div>
  );
}
