﻿import { z } from 'zod';

export const ZUser = z.object({
  uuid: z.string().uuid(),
  email: z.string().email(),
  attributes: z.record(z.unknown()),
  subscribedFeedUuids: z.array(z.string().uuid()),
});

export type User = z.infer<typeof ZUser>;
