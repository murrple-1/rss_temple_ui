import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { Objects } from '@app/services/data/objects';
import { QueryOptions } from '@app/services/data/query.interface';

import { queryAllFn } from './queryall.function';

class O {
  prop1?: string;
  prop2?: string;
}
type Field = keyof O;
type SortField = Exclude<keyof O, 'prop2'> | 'sort1';

const objs = [new O(), new O(), new O()];

function queryFn(options: QueryOptions<Field, SortField>) {
  const objects: Objects<O> = {};

  if (options.returnTotalCount !== false) {
    objects.totalCount = objs.length;
  }

  if (options.returnObjects !== false) {
    let count = 10;
    let skip = 0;
    if (options.count !== undefined) {
      count = options.count;
    }

    if (options.skip !== undefined) {
      skip = options.skip;
    }

    objects.objects = objs.slice(skip, skip + count);
  }

  return of(objects);
}

describe('queryall.function', () => {
  it('should queryAll', fakeAsync(async () => {
    const objects = await firstValueFrom(queryAllFn({}, queryFn, 1));
    expect(objects.objects).toBeTruthy();
  }));

  it('should queryAll with totalCount', fakeAsync(async () => {
    const objects = await firstValueFrom(
      queryAllFn(
        {
          returnTotalCount: true,
        },
        queryFn,
        1,
      ),
    );
    expect(objects.objects).toBeTruthy();
  }));
});
