import type { CSSProperties, ReactNode } from 'react';

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface-card/80 shadow-lg shadow-black/20 backdrop-blur-sm transition-shadow ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
