import { toHeaders, toParams } from './get.interface';

type Field = 'prop1' | 'prop2';

function fieldsFn(): Field[] {
  return ['prop1'];
}

function apiSessionIdFn() {
  return 'session-token';
}

describe('get.interface', () => {
  it('should generate headers', () => {
    let headers = toHeaders<Field>({}, apiSessionIdFn);
    expect(headers).toEqual({
      'X-Session-ID': apiSessionIdFn(),
    });

    headers = toHeaders<Field>(
      {
        fields: ['prop1'],
      },
      apiSessionIdFn,
    );
    expect(headers).toEqual({
      'X-Session-ID': apiSessionIdFn(),
    });

    headers = toHeaders<Field>(
      {
        apiSessionId: 'another-token',
      },
      apiSessionIdFn,
    );
    expect(headers).toEqual({
      'X-Session-ID': 'another-token',
    });
  });

  it('should generate params', () => {
    let params = toParams<Field>({}, fieldsFn);
    expect(params).toEqual({
      fields: 'prop1',
    });

    params = toParams<Field>(
      {
        fields: ['prop1', 'prop2'],
      },
      fieldsFn,
    );
    expect(params).toEqual({
      fields: 'prop1,prop2',
    });

    params = toParams<Field>(
      {
        apiSessionId: 'another-token',
      },
      fieldsFn,
    );
    expect(params).toEqual({
      fields: 'prop1',
    });
  });
});
