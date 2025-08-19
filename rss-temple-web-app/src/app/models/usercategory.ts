import { z } from 'zod';

export const ZUserCategory = z
  .object({
    uuid: z.uuid(),
    text: z.string(),
    feedUuids: z.array(z.uuid()),
  })
  .partial();

export type UserCategory = z.infer<typeof ZUserCategory>;
