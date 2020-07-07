import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Objects } from '@app/services/data/objects';
import { AllOptions } from '@app/services/data/all.interface';
import { QueryOptions } from '@app/services/data/query.interface';

export function queryAllFn<Field, SortField extends string, T>(
  options: AllOptions<Field, SortField>,
  queryFn: (options: QueryOptions<Field, SortField>) => Observable<Objects<T>>,
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
    mergeMap(retObj => {
      const allCalls: Observable<Objects<T>>[] = [];

      allCalls.push(
        new Observable<Objects<T>>(observer => {
          observer.next(retObj);
          observer.complete();
        }),
      );

      let skip = pageSize;

      while (retObj.totalCount && skip < retObj.totalCount) {
        allCalls.push(
          queryFn({
            count: pageSize,
            fields: options.fields,
            returnObjects: true,
            returnTotalCount: false,
            search: options.search,
            skip,
            sort: options.sort,
            sessionToken: options.sessionToken,
          }),
        );

        skip += pageSize;
      }

      return forkJoin(allCalls).pipe(
        map(allRetObjs => {
          const objs = new Objects<T>();

          objs.objects = allRetObjs.flatMap(_retObj => {
            /* istanbul ignore if  */
            if (_retObj.objects === undefined) {
              return [];
            }
            return _retObj.objects;
          });

          if (options.returnTotalCount) {
            objs.totalCount = objs.objects.length;
          }

          return objs;
        }),
      );
    }),
  );
}
