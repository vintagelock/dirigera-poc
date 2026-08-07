import { useMemo } from 'react';
import { useDevices, useRooms, useScenes } from '../api/queries';
import { RoomSection } from '../components/RoomSection';
import { SceneChip } from '../components/SceneChip';
import { HubErrorNotice } from '../components/HubErrorNotice';
import type { Device } from '../types';

export function Dashboard() {
  const { data: devices, isLoading: devicesLoading, isError: devicesError, refetch: refetchDevices } = useDevices();
  const { data: rooms, isLoading: roomsLoading, isError: roomsError, refetch: refetchRooms } = useRooms();
  const { data: scenes } = useScenes();

  const devicesByRoom = useMemo(() => {
    const map = new Map<string, Device[]>();
    for (const device of devices ?? []) {
      if (!device.room) continue;
      const list = map.get(device.room.id) ?? [];
      list.push(device);
      map.set(device.room.id, list);
    }
    return map;
  }, [devices]);

  if (devicesLoading || roomsLoading) {
    return <p className="text-text-muted">Loading your home…</p>;
  }

  if (devicesError || roomsError) {
    return (
      <HubErrorNotice
        onRetry={() => {
          void refetchDevices();
          void refetchRooms();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {scenes && scenes.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {scenes.map((scene) => (
            <SceneChip key={scene.id} scene={scene} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {(rooms ?? []).map((room) => (
          <RoomSection key={room.id} room={room} devices={devicesByRoom.get(room.id) ?? []} />
        ))}
      </div>

      {(rooms ?? []).length === 0 && (
        <p className="text-text-muted">No rooms found yet — set some up in the IKEA Home smart app.</p>
      )}
    </div>
  );
}
