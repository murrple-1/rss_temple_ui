import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { AllOptions } from '@app/services/data/all.interface';
import { Objects } from '@app/services/data/objects';
import { QueryOptions } from '@app/services/data/query.interface';

export function queryAllFn<Field extends string, SortField extends string, T>(
  options: AllOptions<Field, SortField>,
  queryFn: (options_: QueryOptions<Field, SortField>) => Observable<Objects<T>>,
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
    authToken: options.authToken,
  }).pipe(
    mergeMap(retObj => {
      const allCalls: Observable<Objects<T>>[] = [of(retObj)];

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
            authToken: options.authToken,
          }),
        );

        skip += pageSize;
      }

      return forkJoin(allCalls).pipe(
        map(allRetObjs => {
          const objs: Objects<T> = {};

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
