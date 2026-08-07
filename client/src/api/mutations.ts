import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Device } from '../types';

export interface DevicePatch {
  isOn?: boolean;
  lightLevel?: number;
  colorTemperature?: number;
  colorHue?: number;
  colorSaturation?: number;
  childLock?: boolean;
  statusLight?: boolean;
  transitionTime?: number;
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DevicePatch }) => api.patch<Device>(`/devices/${id}`, patch),

    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ['devices'] });
      const previous = queryClient.getQueryData<Device[]>(['devices']);
      queryClient.setQueryData<Device[]>(['devices'], (old) =>
        old?.map((device) =>
          device.id === id ? { ...device, attributes: { ...device.attributes, ...patch } } : device,
        ),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['devices'], context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useTriggerScene() {
  return useMutation({
    mutationFn: (id: string) => api.post(`/scenes/${id}/trigger`),
  });
}

export function usePair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ paired: boolean }>('/auth/pair'),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
