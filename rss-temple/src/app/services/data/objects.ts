import { z } from 'zod';

export interface Objects<T> {
  totalCount?: number;
  objects?: T[];
}

export function toObjects<T>(
  value: unknown,
  zObjectType: z.ZodType<T>,
): Objects<T> {
  const ZObject: z.ZodType<Objects<T>> = z.object({
    totalCount: z.number(),
    objects: z.array(zObjectType),
  });

  return ZObject.parse(value);
}
