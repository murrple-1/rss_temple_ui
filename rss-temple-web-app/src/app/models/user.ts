import { z } from 'zod';

export const ZUser = z.object({
  uuid: z.uuid(),
  email: z.email(),
  attributes: z.record(z.string(), z.unknown()),
  subscribedFeedUuids: z.array(z.uuid()),
});

export type User = z.infer<typeof ZUser>;
