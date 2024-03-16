import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { AllOptions } from '@app/services/data/all.interface';
import { Objects } from '@app/services/data/objects';
import {
  CreateStableQueryOptions,
  StableQueryOptions,
} from '@app/services/data/stablequery.interface';

export function stableQueryAllFn<
  Field extends string,
  SortField extends string,
  T,
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
  }).pipe(
    mergeMap(token =>
      queryFn({
        token,
        count: pageSize,
        skip: 0,
        fields: options.fields,
        returnObjects: true,
        returnTotalCount: true,
      }).pipe(
        mergeMap(retObj => {
          const allCalls: Observable<Objects<T>>[] = [of(retObj)];

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
      ),
    ),
  );
}
