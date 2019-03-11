import { Observable, forkJoin } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { Objects, toObjects } from '@app/_services/data/objects';
import { AllOptions } from '@app/_services/data/all.interface';
import { QueryOptions } from '@app/_services/data/query.interface';

export function queryAllFn<Field, T>(
  options: AllOptions<Field>,
  queryFn: (options: QueryOptions<Field>) => Observable<Objects<T>>,
  toFn: (t: Object) => T,
  pageSize: number,
) {
  return queryFn({
    count: pageSize,
    fields: options.fields,
    returnObjects: true,
    returnTotalCount: true,
    search: options.search,
    skip: 0,
    sort: options.sort,
    sessionToken: options.sessionToken,
  }).pipe(
    flatMap(retObj => {
      const firstObjs = toObjects<T>(retObj, toFn);

      const allCalls: Observable<Objects<T>>[] = [];

      allCalls.push(
        new Observable<Objects<T>>(observer => {
          observer.next(firstObjs);
          observer.complete();
        }),
      );

      let skip = pageSize;

      while (firstObjs.totalCount && skip < firstObjs.totalCount) {
        allCalls.push(
          queryFn({
            count: pageSize,
            fields: options.fields,
            returnObjects: true,
            returnTotalCount: false,
            search: options.search,
            skip: skip,
            sort: options.sort,
            sessionToken: options.sessionToken,
          }),
        );

        skip += pageSize;
      }

      return forkJoin(allCalls).pipe(
        map(allRetObjs => {
          const objs = new Objects<T>();

          objs.objects = [];

          for (const _retObj of allRetObjs) {
            const obj = toObjects<T>(_retObj, toFn);
            if (obj.objects) {
              objs.objects.push(...obj.objects);
            }
          }

          if (options.returnTotalCount) {
            objs.totalCount = objs.objects.length;
          }

          return objs;
        }),
      );
    }),
  );
}