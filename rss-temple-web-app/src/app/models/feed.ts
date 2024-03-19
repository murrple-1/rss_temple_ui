import { z } from 'zod';

export const ZFeed = z
  .object({
    uuid: z.string().uuid(),
    title: z.string(),
    feedUrl: z.string(),
    homeUrl: z.string().nullable(),
    publishedAt: z
      .union([z.string().datetime({ offset: true }), z.date()])
      .transform(arg => new Date(arg)),
    updatedAt: z
      .union([z.string().datetime({ offset: true }), z.date()])
      .transform(arg => new Date(arg))
      .nullable(),
    isSubscribed: z.boolean(),
    customTitle: z.string().nullable(),
    calculatedTitle: z.string(),
    userCategoryUuids: z.array(z.string().uuid()),
    unreadCount: z.number(),
    readCount: z.number(),
    isDormant: z.boolean(),
  })
  .partial();

export type Feed = z.infer<typeof ZFeed>;
