import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Device, Room, Scene } from '../types';

export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: () => api.get<{ paired: boolean }>('/auth/status'),
  });
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => api.get<Device[]>('/devices'),
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<Room[]>('/rooms'),
  });
}

export function useScenes() {
  return useQuery({
    queryKey: ['scenes'],
    queryFn: () => api.get<Scene[]>('/scenes'),
  });
}
