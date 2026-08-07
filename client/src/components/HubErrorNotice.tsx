import { AlertTriangle } from 'lucide-react';

export function HubErrorNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-danger">
        <AlertTriangle className="h-4 w-4" />
        Can&apos;t reach your Dirigera hub
      </div>
      <p className="text-sm text-text-muted">
        The request to your hub timed out. Make sure the hub is powered on and on the same network, then try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-border bg-surface-card px-4 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
      >
        Retry
      </button>
    </div>
  );
}
