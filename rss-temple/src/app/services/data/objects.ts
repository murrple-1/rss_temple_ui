import {
  JsonValue,
  isJsonObject,
  isJsonArray,
} from '@app/services/data/json.type';

export class Objects<T> {
  totalCount?: number;
  objects?: T[];
}

export function toObjects<T>(
  value: JsonValue,
  fn: (t: JsonValue) => T,
): Objects<T> {
  if (!isJsonObject(value)) {
    throw new Error('JSON must be object');
  }

  const objs = new Objects<T>();

  if (value.totalCount !== undefined) {
    const totalCount = value.totalCount;
    if (typeof totalCount === 'number') {
      objs.totalCount = totalCount;
    } else {
      throw new Error("'totalCount' must be number");
    }
  }

  if (value.objects !== undefined) {
    const objects = value.objects;
    if (isJsonArray(objects)) {
      objs.objects = objects.map(fn);
    } else {
      throw new Error("'objects' must be number");
    }
  }

  return objs;
}
