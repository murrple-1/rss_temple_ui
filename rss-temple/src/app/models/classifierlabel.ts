import { z } from 'zod';

export const ZClassifierLabel = z.object({
  uuid: z.string().uuid(),
  text: z.string(),
});

export type ClassifierLabel = z.infer<typeof ZClassifierLabel>;
