import { z } from 'zod';

export const ZFeedEntry = z
  .object({
    uuid: z.string().uuid(),
    id: z.string().nullable(),
    createdAt: z
      .union([z.string().datetime({ offset: true }), z.date()])
      .transform(arg => new Date(arg))
      .nullable(),
    publishedAt: z
      .union([z.string().datetime({ offset: true }), z.date()])
      .transform(arg => new Date(arg)),
    updatedAt: z
      .union([z.string().datetime({ offset: true }), z.date()])

      .transform(arg => new Date(arg))
      .nullable(),
    title: z.string(),
    url: z.string().url(),
    content: z.string(),
    authorName: z.string().nullable(),
    feedUuid: z.string().uuid(),
    fromSubscription: z.boolean(),
    isRead: z.boolean(),
    isFavorite: z.boolean(),
    readAt: z.date().nullable(),
    language: z.string().nullable(),
  })
  .partial();

export type FeedEntry = z.infer<typeof ZFeedEntry>;
