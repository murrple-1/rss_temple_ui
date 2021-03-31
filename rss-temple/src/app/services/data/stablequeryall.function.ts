import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Objects } from '@app/services/data/objects';
import { AllOptions } from '@app/services/data/all.interface';
import {
  StableQueryOptions,
  CreateStableQueryOptions,
} from '@app/services/data/stablequery.interface';

export function stableQueryAllFn<
  Field extends string,
  SortField extends string,
  T
>(
  options: AllOptions<Field, SortField>,
  createFn: (
    options_: CreateStableQueryOptions<SortField>,
  ) => Observable<string>,
  queryFn: (options_: StableQueryOptions<Field>) => Observable<Objects<T>>,
  pageSize: number,
) {
  return createFn({
    search: options.search,
    sort: options.sort,
    sessionToken: options.sessionToken,
  }).pipe(
    mergeMap(token =>
      queryFn({
        token,
        count: pageSize,
        skip: 0,
        fields: options.fields,
        returnObjects: true,
        returnTotalCount: true,
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
                token,
                count: pageSize,
                fields: options.fields,
                returnObjects: true,
                returnTotalCount: false,
                skip,
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
      ),
    ),
  );
}
