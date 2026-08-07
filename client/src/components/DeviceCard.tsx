import type { Device } from '../types';
import { LightCard } from './LightCard';
import { OutletCard } from './OutletCard';

export function DeviceCard({ device }: { device: Device }) {
  if (device.type === 'light') return <LightCard device={device} />;
  if (device.type === 'outlet') return <OutletCard device={device} />;
  return null;
}
