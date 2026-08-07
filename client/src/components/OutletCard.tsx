import { Plug } from 'lucide-react';
import type { Device } from '../types';
import { useUpdateDevice } from '../api/mutations';
import { Card } from './ui/Card';
import { Toggle } from './ui/Toggle';

const GLOW = '#a78bfa';

export function OutletCard({ device }: { device: Device }) {
  const { mutate, isPending, isError } = useUpdateDevice();
  const { id, room, attributes, capabilities } = device;
  const isOn = attributes.isOn ?? false;
  const supportsChildLock = capabilities.canSend.includes('childLock');

  return (
    <Card
      className="flex flex-col gap-4 p-5"
      style={isOn ? { boxShadow: `0 0 0 1px ${GLOW}55, 0 16px 32px -16px ${GLOW}77` } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: isOn ? `${GLOW}22` : 'var(--color-surface-raised)',
              color: isOn ? GLOW : 'var(--color-text-muted)',
            }}
          >
            <Plug className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">{attributes.customName}</div>
            {room && <div className="truncate text-xs text-text-muted">{room.name}</div>}
          </div>
        </div>
        <Toggle checked={isOn} onChange={(value) => mutate({ id, patch: { isOn: value } })} disabled={isPending} />
      </div>

      {supportsChildLock && (
        <label className="flex items-center justify-between text-xs text-text-muted">
          Child lock
          <Toggle
            checked={attributes.childLock ?? false}
            onChange={(value) => mutate({ id, patch: { childLock: value } })}
            disabled={isPending}
          />
        </label>
      )}

      {attributes.currentActivePower != null && (
        <div className="text-xs text-text-muted">{attributes.currentActivePower} W</div>
      )}

      {isError && <div className="text-xs text-danger">Couldn't reach the hub — try again.</div>}
    </Card>
  );
}
