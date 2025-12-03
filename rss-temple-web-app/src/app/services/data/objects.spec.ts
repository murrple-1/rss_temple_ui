import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { toObjects } from './objects';

const ZType = z.string();

describe('objects', () => {
  it('should parse correct JSON', () => {
    const objects = toObjects(
      {
        totalCount: 0,
        objects: ['something', 'interesting'],
      },
      ZType,
    );

    expect(
      z
        .object({ totalCount: z.number(), objects: z.array(z.string()) })
        .strict()
        .safeParse(objects).success,
    ).toBe(true);
  });

  it('should parse empty', () => {
    const objects = toObjects({}, ZType);

    expect(z.object({}).strict().safeParse(objects).success).toBe(true);
  });

  it('should error malformed', () => {
    expect(() => toObjects([], ZType)).toThrow(z.ZodError);
  });

  it('should error `totalCount` type error', () => {
    expect(() =>
      toObjects(
        {
          totalCount: 'totalCount',
        },
        ZType,
      ),
    ).toThrow(z.ZodError);
  });

  it('should error `objects` type error', () => {
    expect(() =>
      toObjects(
        {
          objects: 'objects',
        },
        ZType,
      ),
    ).toThrow(z.ZodError);
  });
});
