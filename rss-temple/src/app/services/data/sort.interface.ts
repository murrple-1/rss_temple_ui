type Direction = 'ASC' | 'DESC';

export class Sort<K extends string> extends Map<K, Direction> {
  private _orderedKeys: K[] | undefined;

  get orderedKeys() {
    if (this._orderedKeys === undefined) {
      this._orderedKeys = [];
    }

    return this._orderedKeys;
  }

  set orderedKeys(orderedKeys: K[]) {
    this._orderedKeys = orderedKeys;
  }

  clear() {
    super.clear();
    this.orderedKeys = [];
  }

  delete(key: K) {
    const success = super.delete(key);
    this.orderedKeys = this.orderedKeys.filter(k => k !== key);
    return success;
  }

  forEach(
    callbackfn: (value: Direction, key: K, map: Map<K, Direction>) => void,
    thisArg?: any,
  ) {
    this.orderedKeys.forEach(k =>
      callbackfn.call(thisArg, super.get(k) as Direction, k, this),
    );
  }

  set(key: K, value: Direction) {
    super.set(key, value);
    this.orderedKeys = [...this.orderedKeys.filter(k => k !== key), key];
    return this;
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  entries() {
    return this.orderedKeys
      .map(k => [k, this.get(k)] as [K, Direction])
      .values();
  }

  keys() {
    return this.orderedKeys.values();
  }

  values() {
    return this.orderedKeys.map(k => this.get(k) as Direction).values();
  }
}
