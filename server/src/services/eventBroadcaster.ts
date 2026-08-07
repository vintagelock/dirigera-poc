import { EventEmitter } from 'node:events';
import type { DirigeraClient, Event } from 'dirigera';

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

let started = false;

export function startBroadcasting(client: DirigeraClient): void {
  if (started) return;
  started = true;
  console.info('Listening for hub updates');
  client.startListeningForUpdates((event: Event) => {
    const detail =
      'data' in event && event.data && typeof event.data === 'object' ? (event.data as { id?: string }).id : undefined;
    console.debug(`[hub] ${event.type}${detail ? ` (${detail})` : ''}`);
    emitter.emit('update', event);
  });
}

export function subscribe(listener: (event: Event) => void): () => void {
  emitter.on('update', listener);
  return () => emitter.off('update', listener);
}
