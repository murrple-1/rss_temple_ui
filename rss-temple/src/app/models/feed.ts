import { z } from 'zod';

export const ZFeed = z
  .object({
    uuid: z.string().uuid(),
    title: z.string(),
    feedUrl: z.string(),
    homeUrl: z.string().nullable(),
    publishedAt: z.date(),
    updatedAt: z.date().nullable(),
    subscribed: z.boolean(),
    customTitle: z.string().nullable(),
    calculatedTitle: z.string(),
    userCategoryUuids: z.array(z.string().uuid()),
    unreadCount: z.number(),
    readCount: z.number(),
  })
  .partial();

export type Feed = z.infer<typeof ZFeed>;
