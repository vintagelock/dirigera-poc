export class HubTimeoutError extends Error {
  constructor(message = 'Timed out waiting for the Dirigera hub to respond') {
    super(message);
    this.name = 'HubTimeoutError';
  }
}

// The dirigera library's own HTTP client has no request timeout configured,
// so a request to an unreachable/unresponsive hub can hang indefinitely
// instead of failing — which left the UI stuck on a spinner forever with no
// error to show. Bound every hub call so it fails visibly instead.
export function withHubTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new HubTimeoutError()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}
