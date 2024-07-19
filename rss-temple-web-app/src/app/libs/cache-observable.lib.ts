import { Duration, add, isAfter } from 'date-fns';
import { Observable, shareReplay } from 'rxjs';

export function cacheObservable<T>(
  refreshFn: () => Observable<T>,
  cacheInterval: Duration,
  bufferSize: number = 1,
): Observable<T> {
  let cache: Observable<T> | null = null;
  let expiresAt: Date | null = null;
  return new Observable<T>(subscriber => {
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
}
