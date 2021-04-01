import { Sort } from '@app/services/data/sort.interface';

import { toBody, toHeaders, toParams } from './query.interface';

type Field = 'prop1' | 'prop2';
type SortField = 'prop1' | 'sort1';

function fieldsFn(): Field[] {
  return ['prop1'];
}

function sessionTokenFn() {
  return 'session-token';
}

describe('query.interface', () => {
  it('should parse empty body', () => {
    const body = toBody({}, fieldsFn);
    expect(body).toEqual({
      fields: fieldsFn(),
    });
  });

  it('should parse body with fields', () => {
    const fields: Field[] = ['prop1', 'prop2'];
    const body = toBody(
      {
        fields,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields,
    });
  });

  it('should parse body with count', () => {
    const count = 5;
    const body = toBody(
      {
        count,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields: fieldsFn(),
      count,
    });
  });

  it('should parse body with skip', () => {
    const skip = 5;
    const body = toBody(
      {
        skip,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields: fieldsFn(),
      skip,
    });
  });

  it('should parse body with search', () => {
    const search = 'prop1:"some text"';
    const body = toBody(
      {
        search,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields: fieldsFn(),
      search,
    });
  });

  it('should parse body with sort', () => {
    const sort = new Sort<SortField>([
      ['prop1', 'ASC'],
      ['sort1', 'DESC'],
    ]);
    const body = toBody(
      {
        sort,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields: fieldsFn(),
      sort: 'prop1:ASC,sort1:DESC',
    });
  });

  it('should parse body with returnObjects', () => {
    const returnObjects = true;
    const body = toBody(
      {
        returnObjects,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields: fieldsFn(),
      objects: returnObjects,
    });
  });

  it('should parse body with returnTotalCount', () => {
    const returnTotalCount = true;
    const body = toBody(
      {
        returnTotalCount,
      },
      fieldsFn,
    );
    expect(body).toEqual({
      fields: fieldsFn(),
      totalCount: returnTotalCount,
    });
  });

  it('should parse headers', () => {
    const headers = toHeaders({}, sessionTokenFn);
    expect(headers).toEqual({
      'X-Session-Token': sessionTokenFn(),
    });
  });

  it('should parse params', () => {
    const params = toParams();
    expect(Object.keys(params)).toEqual([]);
  });

  it('should parse params with descriptor', () => {
    const params = toParams('objects');
    expect(Object.keys(params)).toEqual(['_']);
    expect(params['_']).toEqual('objects');
  });
});
