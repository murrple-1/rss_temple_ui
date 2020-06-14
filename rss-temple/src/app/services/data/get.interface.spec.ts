import { toHeaders, toParams } from './get.interface';

type Field = 'prop1' | 'prop2';

function fieldsFn(): Field[] {
  return ['prop1'];
}

function sessionTokenFn() {
  return 'session-token';
}

describe('get.interface', () => {
  it('should generate headers', () => {
    let headers = toHeaders<Field>({}, sessionTokenFn);
    expect(headers).toEqual({
      'X-Session-Token': sessionTokenFn(),
    });

    headers = toHeaders<Field>(
      {
        fields: ['prop1'],
      },
      sessionTokenFn,
    );
    expect(headers).toEqual({
      'X-Session-Token': sessionTokenFn(),
    });

    headers = toHeaders<Field>(
      {
        sessionToken: 'another-token',
      },
      sessionTokenFn,
    );
    expect(headers).toEqual({
      'X-Session-Token': 'another-token',
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
        sessionToken: 'another-token',
      },
      fieldsFn,
    );
    expect(params).toEqual({
      fields: 'prop1',
    });
  });
});
