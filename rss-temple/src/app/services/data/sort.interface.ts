type Direction = 'ASC' | 'DESC';

export class Sort<K extends string> implements Map<K, Direction> {
  // Map should be ordered, per the docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
  private innerMap: Map<K, Direction>;

  // TODO this is more correct, but requires Angular update their typescript version
  //constructor(entries?: ReadonlyArray<readonly [K, Direction]> | null) {
  constructor(entries?: [K, Direction][] | null) {
    this.innerMap = new Map<K, Direction>(entries);
  }

  clear() {
    this.innerMap.clear();
  }

  delete(key: K) {
    return this.innerMap.delete(key);
  }

  forEach(
    callbackfn: (value: Direction, key: K, map: Map<K, Direction>) => void,
    thisArg?: any,
  ) {
    this.innerMap.forEach(callbackfn, thisArg);
  }

  get(key: K) {
    return this.innerMap.get(key);
  }

  has(key: K) {
    return this.innerMap.has(key);
  }

  set(key: K, value: Direction) {
    this.innerMap.set(key, value);
    return this;
  }

  get size() {
    return this.innerMap.size;
  }

  [Symbol.iterator]() {
    return this.innerMap[Symbol.iterator]();
  }

  entries() {
    return this.innerMap.entries();
  }

  keys() {
    return this.innerMap.keys();
  }
  values() {
    return this.innerMap.values();
  }

  get [Symbol.toStringTag]() {
    return this.innerMap[Symbol.toStringTag];
  }
}
