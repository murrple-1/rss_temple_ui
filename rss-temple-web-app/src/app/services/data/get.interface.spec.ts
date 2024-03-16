import { toHeaders, toParams } from './get.interface';

type Field = 'prop1' | 'prop2';

function fieldsFn(): Field[] {
  return ['prop1'];
}

function csrfTokenFn() {
  return 'auth-token';
}

describe('get.interface', () => {
  it('should generate headers', () => {
    let headers = toHeaders<Field>({}, csrfTokenFn);
    expect(headers).toEqual({
      'X-CSRFToken': csrfTokenFn(),
    });

    headers = toHeaders<Field>(
      {
        fields: ['prop1'],
      },
      csrfTokenFn,
    );
    expect(headers).toEqual({
      'X-CSRFToken': csrfTokenFn(),
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
  });
});
