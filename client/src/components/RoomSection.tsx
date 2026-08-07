import type { Device, Room } from '../types';
import { DeviceCard } from './DeviceCard';

export function RoomSection({ room, devices }: { room: Room; devices: Device[] }) {
  if (devices.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-text-muted uppercase">{room.name}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </section>
  );
}
