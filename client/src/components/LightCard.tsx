import { useEffect, useState } from 'react';
import { Lightbulb, Palette, Thermometer } from 'lucide-react';
import type { Device } from '../types';
import { useUpdateDevice } from '../api/mutations';
import { Card } from './ui/Card';
import { Toggle } from './ui/Toggle';
import { Slider } from './ui/Slider';

const HUE_GRADIENT =
  'linear-gradient(to right, hsl(0,90%,55%), hsl(60,90%,55%), hsl(120,90%,55%), hsl(180,90%,55%), hsl(240,90%,55%), hsl(300,90%,55%), hsl(360,90%,55%))';

export function LightCard({ device }: { device: Device }) {
  const { mutate, isPending, isError } = useUpdateDevice();
  const { id, room, attributes, capabilities } = device;
  const canSend = capabilities.canSend;

  const isOn = attributes.isOn ?? false;
  const supportsBrightness = canSend.includes('lightLevel');
  const supportsTemperature = canSend.includes('colorTemperature');
  const supportsColor = canSend.includes('colorHue') && canSend.includes('colorSaturation');

  const [level, setLevel] = useState(attributes.lightLevel ?? 100);
  const [temp, setTemp] = useState(attributes.colorTemperature ?? attributes.colorTemperatureMin ?? 2700);
  const [hue, setHue] = useState(attributes.colorHue ?? 0);

  useEffect(() => setLevel(attributes.lightLevel ?? 100), [attributes.lightLevel]);
  useEffect(() => setTemp(attributes.colorTemperature ?? 2700), [attributes.colorTemperature]);
  useEffect(() => setHue(attributes.colorHue ?? 0), [attributes.colorHue]);

  const glowColor =
    attributes.colorMode === 'color' && attributes.colorHue != null ?
      `hsl(${attributes.colorHue}, ${Math.round((attributes.colorSaturation ?? 0.6) * 100)}%, 60%)`
    : '#a78bfa';

  return (
    <Card
      className="flex flex-col gap-4 p-5"
      style={isOn ? { boxShadow: `0 0 0 1px ${glowColor}55, 0 16px 32px -16px ${glowColor}77` } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: isOn ? `${glowColor}22` : 'var(--color-surface-raised)',
              color: isOn ? glowColor : 'var(--color-text-muted)',
            }}
          >
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">{attributes.customName}</div>
            {room && <div className="truncate text-xs text-text-muted">{room.name}</div>}
          </div>
        </div>
        <Toggle checked={isOn} onChange={(value) => mutate({ id, patch: { isOn: value } })} disabled={isPending} />
      </div>

      {isOn && supportsBrightness && (
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-xs text-text-muted">Bright</span>
          <Slider
            value={level}
            min={1}
            max={100}
            onChange={setLevel}
            onCommit={(value) => mutate({ id, patch: { lightLevel: value } })}
          />
          <span className="w-9 shrink-0 text-right text-xs text-text-muted">{level}%</span>
        </div>
      )}

      {isOn && supportsTemperature && (
        <div className="flex items-center gap-3">
          <Thermometer className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          <Slider
            value={temp}
            min={attributes.colorTemperatureMin ?? 2200}
            max={attributes.colorTemperatureMax ?? 4000}
            step={50}
            onChange={setTemp}
            onCommit={(value) => mutate({ id, patch: { colorTemperature: value } })}
          />
          <span className="w-12 shrink-0 text-right text-xs text-text-muted">{temp}K</span>
        </div>
      )}

      {isOn && supportsColor && (
        <div className="flex items-center gap-3">
          <Palette className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          <Slider
            value={hue}
            min={0}
            max={359}
            onChange={setHue}
            onCommit={(value) =>
              mutate({ id, patch: { colorHue: value, colorSaturation: attributes.colorSaturation ?? 0.7 } })
            }
            background={HUE_GRADIENT}
          />
        </div>
      )}

      {isError && <div className="text-xs text-danger">Couldn't reach the hub — try again.</div>}
    </Card>
  );
}
