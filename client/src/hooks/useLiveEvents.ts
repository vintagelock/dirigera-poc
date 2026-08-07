import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Device } from '../types';

type ConnectionStatus = 'connecting' | 'open' | 'closed';

interface DeviceStateChangedData {
  id: string;
  attributes?: Partial<Device['attributes']>;
}

const INVALIDATES_DEVICES_AND_ROOMS = new Set([
  'deviceAdded',
  'deviceRemoved',
  'deviceConfigurationChanged',
  'roomCreated',
  'roomUpdated',
  'roomDeleted',
]);

export function useLiveEvents(enabled: boolean): ConnectionStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    if (!enabled) return;

    setStatus('connecting');
    const source = new EventSource('/api/events');

    source.onopen = () => setStatus('open');
    source.onerror = () => setStatus('closed');

    source.onmessage = (message: MessageEvent<string>) => {
      let event: { type: string; data?: unknown };
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }

      if (event.type === 'deviceStateChanged') {
        const data = event.data as DeviceStateChangedData;
        queryClient.setQueryData<Device[]>(['devices'], (old) =>
          old?.map((device) =>
            device.id === data.id ? { ...device, attributes: { ...device.attributes, ...data.attributes } } : device,
          ),
        );
        return;
      }

      if (INVALIDATES_DEVICES_AND_ROOMS.has(event.type)) {
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        return;
      }

      if (event.type.startsWith('scene')) {
        queryClient.invalidateQueries({ queryKey: ['scenes'] });
      }
    };

    return () => {
      source.close();
      setStatus('closed');
    };
  }, [enabled, queryClient]);

  return status;
}
