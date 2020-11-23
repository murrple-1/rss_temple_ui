// via https://github.com/sindresorhus/type-fest
export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = Array<JsonValue>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export function isJsonObject(value: JsonValue): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value);
}
