export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onCommit,
  disabled,
  background,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  disabled?: boolean;
  background?: string;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      onMouseUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      onTouchEnd={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      onKeyUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      className="h-1.5 w-full cursor-pointer rounded-full disabled:opacity-40"
      style={{ background: background ?? 'var(--color-surface-raised)' }}
    />
  );
}
