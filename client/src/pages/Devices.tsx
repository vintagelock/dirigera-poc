import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useDevices } from '../api/queries';
import { DeviceCard } from '../components/DeviceCard';
import { HubErrorNotice } from '../components/HubErrorNotice';

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'light', label: 'Lights' },
  { value: 'outlet', label: 'Outlets' },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]['value'];

export function Devices() {
  const { data: devices, isLoading, isError, refetch } = useDevices();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (devices ?? [])
      .filter((device) => type === 'all' || device.type === type)
      .filter((device) => !q || (device.attributes.customName ?? '').toLowerCase().includes(q));
  }, [devices, query, type]);

  if (isLoading) {
    return <p className="text-text-muted">Loading devices…</p>;
  }

  if (isError) {
    return <HubErrorNotice onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devices…"
            className="w-full rounded-full border border-border bg-surface-card py-2 pr-3 pl-9 text-sm text-text outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setType(f.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                type === f.value ? 'bg-accent text-black' : 'text-text-muted hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ?
        <p className="text-text-muted">No devices match.</p>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      }
    </div>
  );
}
