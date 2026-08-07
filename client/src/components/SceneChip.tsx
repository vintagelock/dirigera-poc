import { Sparkles } from 'lucide-react';
import type { Scene } from '../types';
import { useTriggerScene } from '../api/mutations';

export function SceneChip({ scene }: { scene: Scene }) {
  const { mutate, isPending } = useTriggerScene();

  return (
    <button
      type="button"
      onClick={() => mutate(scene.id)}
      disabled={isPending}
      className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50"
    >
      <Sparkles className="h-4 w-4" />
      {scene.info.name}
    </button>
  );
}
