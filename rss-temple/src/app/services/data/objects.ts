import { z } from 'zod';

export interface Objects<T> {
  totalCount?: number;
  objects?: T[];
}

export function toObjects<T, Def extends z.ZodTypeDef = z.ZodTypeDef>(
  value: unknown,
  zObjectType: z.ZodType<T, Def, unknown>,
): Objects<T> {
  const ZObjects = z
    .object({
      totalCount: z.number(),
      objects: z.array(zObjectType),
    })
    .partial();

  return ZObjects.parse(value);
}
