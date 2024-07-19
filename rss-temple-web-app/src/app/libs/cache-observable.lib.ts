import { Duration, add, isAfter } from 'date-fns';
import { Observable, shareReplay } from 'rxjs';

export interface CachedObservable<T> {
  observable: Observable<T>;
  clear: () => void;
}

export function cacheObservable<T>(
  refreshFn: () => Observable<T>,
  cacheInterval: Duration,
  bufferSize: number = 1,
): CachedObservable<T> {
  let cache: Observable<T> | null = null;
  let expiresAt: Date | null = null;
  const observable = new Observable<T>(subscriber => {
    if (
      cache !== null &&
      expiresAt !== null &&
      isAfter(expiresAt, new Date())
    ) {
      cache.subscribe(subscriber);
    } else {
      cache = refreshFn().pipe(shareReplay(bufferSize));
      expiresAt = add(new Date(), cacheInterval);
      cache.subscribe(subscriber);
    }
  });

  return {
    observable,
    clear: () => {
      cache = null;
      expiresAt = null;
    },
  };
}
