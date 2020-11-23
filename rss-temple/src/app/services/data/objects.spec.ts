import { JsonValue } from '@app/libs/json.lib';

import { toObjects, Objects } from './objects';

type Type = Record<string, unknown>;

function toType(_value: JsonValue): Type {
  return {};
}

describe('objects', () => {
  it('should parse correct JSON', () => {
    const objects = toObjects(
      {
        totalCount: 0,
        objects: [],
      },
      toType,
    );

    expect(objects).toBeInstanceOf(Objects);
  });

  it('should parse empty', () => {
    const objects = toObjects({}, toType);

    expect(objects).toBeInstanceOf(Objects);
  });

  it('should error malformed', () => {
    expect(() => toObjects([], toType)).toThrowError(/must be object/);
  });

  it('should error `totalCount` type error', () => {
    expect(() =>
      toObjects(
        {
          totalCount: 'totalCount',
        },
        toType,
      ),
    ).toThrowError(/totalCount.*?must be number/);
  });

  it('should error `objects` type error', () => {
    expect(() =>
      toObjects(
        {
          objects: 'objects',
        },
        toType,
      ),
    ).toThrowError(/objects.*?must be array/);
  });
});
