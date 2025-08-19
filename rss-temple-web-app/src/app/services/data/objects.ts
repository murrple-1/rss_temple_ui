import { z } from 'zod';

export interface Objects<T> {
  totalCount?: number;
  objects?: T[];
}

export function toObjects<Output>(
  value: unknown,
  zObjectType: z.ZodType<Output>,
): Objects<Output> {
  const ZObjects = z
    .object({
      totalCount: z.number(),
      objects: z.array(zObjectType),
    })
    .partial();

  return ZObjects.parse(value);
}
