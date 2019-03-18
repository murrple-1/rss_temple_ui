import { Observable, forkJoin } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { Objects } from '@app/_services/data/objects';
import { AllOptions } from '@app/_services/data/all.interface';
import { QueryOptions } from '@app/_services/data/query.interface';
import { JsonValue } from '@app/_services/data/json.type';

export function queryAllFn<Field, T>(
  options: AllOptions<Field>,
  queryFn: (options: QueryOptions<Field>) => Observable<Objects<T>>,
  toFn: (t: JsonValue) => T,
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

          // TODO replace with `flatMap()` when more browsers support
          // via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#reduce_and_concat
          objs.objects = allRetObjs.reduce(
            (arr: T[], _retObj: Objects<T>) =>
              _retObj.objects ? arr.concat(_retObj.objects) : arr,
            [],
          );

          if (options.returnTotalCount) {
            objs.totalCount = objs.objects.length;
          }

          return objs;
        }),
      );
    }),
  );
}
