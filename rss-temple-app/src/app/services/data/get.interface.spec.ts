import { toHeaders, toParams } from './get.interface';

type Field = 'prop1' | 'prop2';

function fieldsFn(): Field[] {
  return ['prop1'];
}

function authTokenFn() {
  return 'auth-token';
}

describe('get.interface', () => {
  it('should generate headers', () => {
    let headers = toHeaders<Field>({}, authTokenFn);
    expect(headers).toEqual({
      'Authorization': `Token ${authTokenFn()}`,
    });

    headers = toHeaders<Field>(
      {
        fields: ['prop1'],
      },
      authTokenFn,
    );
    expect(headers).toEqual({
      'Authorization': `Token ${authTokenFn()}`,
    });

    headers = toHeaders<Field>(
      {
        authToken: 'another-token',
      },
      authTokenFn,
    );
    expect(headers).toEqual({
      'Authorization': 'Token another-token',
    });
  });

  it('should generate params', () => {
    let params = toParams<Field>({}, fieldsFn);
    expect(params).toEqual({
      fields: ['prop1'],
    });

    params = toParams<Field>(
      {
        fields: ['prop1', 'prop2'],
      },
      fieldsFn,
    );
    expect(params).toEqual({
      fields: ['prop1', 'prop2'],
    });

    params = toParams<Field>(
      {
        authToken: 'another-token',
      },
      fieldsFn,
    );
    expect(params).toEqual({
      fields: ['prop1'],
    });
  });
});
