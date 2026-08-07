import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Lightbulb, Radio, Terminal } from 'lucide-react';
import { useLiveEvents } from '../../hooks/useLiveEvents';

export function AppShell({ children, paired }: { children: ReactNode; paired: boolean }) {
  const status = useLiveEvents(paired);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Radio className="h-5 w-5 text-accent" />
            Dirigera
          </div>
          <nav className="flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1">
            <NavTab to="/" icon={<LayoutGrid className="h-4 w-4" />} label="Dashboard" />
            <NavTab to="/devices" icon={<Lightbulb className="h-4 w-4" />} label="Devices" />
            <NavTab to="/debug" icon={<Terminal className="h-4 w-4" />} label="Debug" />
          </nav>
          {paired && <ConnectionBadge status={status} />}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

function NavTab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-accent text-black' : 'text-text-muted hover:text-text'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function ConnectionBadge({ status }: { status: 'connecting' | 'open' | 'closed' }) {
  const color =
    status === 'open' ? 'bg-success'
    : status === 'connecting' ? 'bg-accent'
    : 'bg-danger';
  const label =
    status === 'open' ? 'Live'
    : status === 'connecting' ? 'Connecting'
    : 'Offline';

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted">
      <span className={`h-2 w-2 rounded-full ${color} ${status === 'open' ? 'animate-pulse' : ''}`} />
      {label}
    </div>
  );
}
