import {
  JsonArray,
  JsonObject,
  JsonValue,
  isJsonArray,
  isJsonObject,
} from './json.lib';

describe('json.lib', () => {
  it('should identify JSON arrays', () => {
    const json: JsonValue = [];
    expect(isJsonArray(json)).toBeTrue();

    (json as JsonArray).push(...[1, 'a', {}]);
    expect(isJsonArray(json)).toBeTrue();
  });

  it('should identify JSON objects', () => {
    const json: JsonValue = {};
    expect(isJsonObject(json)).toBeTrue();

    (json as JsonObject)['prop1'] = 1;
    (json as JsonObject)['prop2'] = 'a';
    (json as JsonObject)['prop3'] = {};
    expect(isJsonObject(json)).toBeTrue();
  });

  it('should not misidentify JSON arrays', () => {
    let json: JsonValue = {};
    expect(isJsonArray(json)).toBeFalse();

    (json as JsonObject)['prop1'] = 1;
    (json as JsonObject)['prop2'] = 'a';
    (json as JsonObject)['prop3'] = {};
    expect(isJsonArray(json)).toBeFalse();

    json = 1;
    expect(isJsonArray(json)).toBeFalse();

    json = 'a';
    expect(isJsonArray(json)).toBeFalse();

    json = true;
    expect(isJsonArray(json)).toBeFalse();
  });

  it('should not misidentify JSON objects', () => {
    let json: JsonValue = [];
    expect(isJsonObject(json)).toBeFalse();

    (json as JsonArray).push(...[1, 'a', {}]);
    expect(isJsonObject(json)).toBeFalse();

    json = 1;
    expect(isJsonObject(json)).toBeFalse();

    json = 'a';
    expect(isJsonObject(json)).toBeFalse();

    json = true;
    expect(isJsonObject(json)).toBeFalse();
  });
});
