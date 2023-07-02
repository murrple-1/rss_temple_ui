import { z } from 'zod';

export const ZUserCategory = z
  .object({
    uuid: z.string().uuid(),
    text: z.string(),
    feedUuids: z.array(z.string().uuid()),
  })
  .partial();

export type UserCategory = z.infer<typeof ZUserCategory>;
