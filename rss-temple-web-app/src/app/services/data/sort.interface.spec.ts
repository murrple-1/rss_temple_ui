import { describe, expect, it, vi } from 'vitest';

import { Sort } from './sort.interface';

type SortField = 'sort1' | 'sort2';

describe('sort.interface', () => {
  it('should construct without entries', () => {
    const sort = new Sort<SortField>();
    expect(sort).toBeInstanceOf(Sort);
  });

  it('should construct with null', () => {
    const sort = new Sort<SortField>(null);
    expect(sort).toBeInstanceOf(Sort);
  });

  it('should construct with entries', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(sort).toBeInstanceOf(Sort);
  });

  it('should orderedKeys', () => {
    let sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(sort.orderedKeys).toEqual(['sort1', 'sort2']);

    sort = new Sort<SortField>([
      ['sort2', 'ASC'],
      ['sort1', 'DESC'],
    ]);
    expect(sort.orderedKeys).toEqual(['sort2', 'sort1']);
  });

  it('should get', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(sort.get('sort1')).toBe('ASC');
    expect(sort.get('sort2')).toBe('DESC');
  });

  it('should has', () => {
    const sort = new Sort<SortField>([['sort1', 'ASC']]);
    expect(sort.has('sort1')).toBe(true);
    expect(sort.has('sort2')).toBe(false);
  });

  it('should set', () => {
    const sort = new Sort<SortField>([['sort1', 'ASC']]);
    sort.set('sort2', 'DESC');
    expect(sort.get('sort1')).toBe('ASC');
    expect(sort.get('sort2')).toBe('DESC');
    sort.set('sort1', 'DESC');
    expect(sort.get('sort1')).toBe('DESC');
    expect(sort.get('sort2')).toBe('DESC');
  });

  it('should delete', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(sort.get('sort1')).toBe('ASC');
    expect(sort.get('sort2')).toBe('DESC');
    sort.delete('sort1');
    expect(sort.get('sort1')).toBeUndefined();
    expect(sort.get('sort2')).toBe('DESC');
    sort.delete('sort1');
    expect(sort.get('sort1')).toBeUndefined();
    expect(sort.get('sort2')).toBe('DESC');
    sort.delete('sort2');
    expect(sort.get('sort1')).toBeUndefined();
    expect(sort.get('sort2')).toBeUndefined();
  });

  it('should size', () => {
    const sort = new Sort<SortField>([['sort1', 'ASC']]);
    expect(sort.size).toBe(1);
    sort.set('sort1', 'DESC');
    expect(sort.size).toBe(1);
    sort.set('sort2', 'DESC');
    expect(sort.size).toBe(2);
    sort.delete('sort1');
    expect(sort.size).toBe(1);
  });

  it('should clear', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(sort.get('sort1')).toBe('ASC');
    expect(sort.get('sort2')).toBe('DESC');
    expect(sort.size).toBe(2);
    sort.clear();
    expect(sort.get('sort1')).toBeUndefined();
    expect(sort.get('sort2')).toBeUndefined();
    expect(sort.size).toBe(0);
  });

  it('should forEach', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    const fn = vi.fn();
    sort.forEach(fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('ASC', 'sort1', sort);
    expect(fn).toHaveBeenCalledWith('DESC', 'sort2', sort);
  });

  it('should keys', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(Array.from(sort.keys())).toEqual(['sort1', 'sort2']);
  });

  it('should values', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    expect(Array.from(sort.values())).toEqual(['ASC', 'DESC']);
  });

  it('should iterate', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    const fn = vi.fn();
    for (const entry of sort) {
      fn(entry);
    }
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should toString', () => {
    const sort = new Sort<SortField>([
      ['sort1', 'ASC'],
      ['sort2', 'DESC'],
    ]);
    const str = String(sort);
    expect(str).toEqual(expect.stringMatching(/Sort/));
  });
});
