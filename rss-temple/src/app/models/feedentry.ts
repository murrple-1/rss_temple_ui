import { z } from 'zod';

export const ZFeedEntry = z
  .object({
    uuid: z.string().uuid(),
    id: z.string().nullable(),
    createdAt: z.coerce.date().nullable(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().nullable(),
    title: z.string(),
    url: z.string().url(),
    content: z.string(),
    authorName: z.string().nullable(),
    feedUuid: z.string().uuid(),
    fromSubscription: z.boolean(),
    isRead: z.boolean(),
    isFavorite: z.boolean(),
    readAt: z.date().nullable(),
  })
  .partial();

export type FeedEntry = z.infer<typeof ZFeedEntry>;
