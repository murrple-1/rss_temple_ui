import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { format as formatDate, parse as parseDate } from 'date-fns';
import { firstValueFrom, of } from 'rxjs';
import { z } from 'zod';

import { ZFeedEntry } from '@app/models/feedentry';
import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { FeedEntryService } from './feedentry.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'delete',
    'request',
  ]);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const feedEntryService = new FeedEntryService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    feedEntryService,
  };
}

describe('FeedEntryService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should get', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const feed = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(ZFeedEntry.safeParse(feed).success).toBeTrue();
  }));

  it('should query', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const feeds = await firstValueFrom(feedEntryService.query());

    expect(feeds.objects).toBeDefined();
  }));

  it('should queryAll', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const feeds = await firstValueFrom(feedEntryService.queryAll());

    expect(feeds.objects).toBeDefined();
  }));

  it('should read', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.read('123e4567-e89b-12d3-a456-426614174000'),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should unread', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.unread('123e4567-e89b-12d3-a456-426614174000'),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should readSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.readSome(
        [
          '123e4567-e89b-12d3-a456-426614174000',
          '123e4567-e89b-12d3-a456-426614174001',
        ],
        [
          '123e4567-e89b-12d3-a456-426614174002',
          '123e4567-e89b-12d3-a456-426614174003',
        ],
      ),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should unreadSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.request.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.unreadSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ]),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should favorite', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.favorite('123e4567-e89b-12d3-a456-426614174000'),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should unfavorite', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.unfavorite('123e4567-e89b-12d3-a456-426614174000'),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should favoriteSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.favoriteSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ]),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should unfavoriteSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.request.and.returnValue(of());

    await firstValueFrom(
      feedEntryService.unfavoriteSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ]),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should fail get when response is not JSON object', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(of(4));

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const uuid = '123e4567-e89b-12d3-a456-426614174000';

    httpClientSpy.get.and.returnValue(
      of({
        uuid,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.uuid).toBe(uuid);
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `id`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const id = 'some-id';

    httpClientSpy.get.and.returnValue(
      of({
        id,
      }),
    );

    let feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.id).toBe(id);

    httpClientSpy.get.and.returnValue(
      of({
        id: null,
      }),
    );

    feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.id).toBeNull();
  }));

  it('should `id` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        id: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `createdAt`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const createdAt = parseDate(
      '2020-01-01 00:00:00',
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: formatDate(createdAt, "yyyy-MM-dd'T'HH:mm:ssXXXX"),
      }),
    );

    let feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.createdAt).toEqual(createdAt);

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: null,
      }),
    );

    feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.createdAt).toBeNull();
  }));

  it('should `createdAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `createdAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: 'bad datetime',
      }),
    );

    await expectAsync(
      firstValueFrom(feedEntryService.get('http://www.fake.com/rss.xml')),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `publishedAt`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const publishedAt = parseDate(
      '2020-01-01 00:00:00',
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: formatDate(publishedAt, "yyyy-MM-dd'T'HH:mm:ssXXXX"),
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.publishedAt).toEqual(publishedAt);
  }));

  it('should `publishedAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `publishedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 'bad datetime',
      }),
    );

    await expectAsync(
      firstValueFrom(feedEntryService.get('http://www.fake.com/rss.xml')),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `updatedAt`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const updatedAt = parseDate(
      '2020-01-01 00:00:00',
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: formatDate(updatedAt, "yyyy-MM-dd'T'HH:mm:ssXXXX"),
      }),
    );

    let feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.updatedAt).toEqual(updatedAt);

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: null,
      }),
    );

    feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.updatedAt).toBeNull();
  }));

  it('should `updatedAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `updatedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 'bad datetime',
      }),
    );

    await expectAsync(
      firstValueFrom(feedEntryService.get('http://www.fake.com/rss.xml')),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `title`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const title = 'A Title';

    httpClientSpy.get.and.returnValue(
      of({
        title,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.title).toBe(title);
  }));

  it('should `title` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        title: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `url`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const url = 'http://www.fake.com/entry/1';

    httpClientSpy.get.and.returnValue(
      of({
        url,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.url).toBe(url);
  }));

  it('should `url` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        url: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `content`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const content = '<div>Some Content</div>';

    httpClientSpy.get.and.returnValue(
      of({
        content,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.content).toBe(content);
  }));

  it('should `content` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        content: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);

    httpClientSpy.get.and.returnValue(
      of({
        content: null,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `authorName`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const authorName = 'John Doe';

    httpClientSpy.get.and.returnValue(
      of({
        authorName,
      }),
    );

    let feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.authorName).toBe(authorName);

    httpClientSpy.get.and.returnValue(
      of({
        authorName: null,
      }),
    );

    feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.authorName).toBeNull();
  }));

  it('should `authorName` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        authorName: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `fromSubscription`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const fromSubscription = true;

    httpClientSpy.get.and.returnValue(
      of({
        fromSubscription,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.fromSubscription).toBe(fromSubscription);
  }));

  it('should `fromSubscription` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        fromSubscription: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `isRead`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const isRead = true;

    httpClientSpy.get.and.returnValue(
      of({
        isRead,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.isRead).toBe(isRead);
  }));

  it('should `isRead` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        isRead: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `isFavorite`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const isFavorite = true;

    httpClientSpy.get.and.returnValue(
      of({
        isFavorite,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.isFavorite).toBe(isFavorite);
  }));

  it('should `isFavorite` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        isFavorite: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should `feedUuid`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const feedUuid = '123e4567-e89b-12d3-a456-426614174000';

    httpClientSpy.get.and.returnValue(
      of({
        feedUuid,
      }),
    );

    const feedEntry = await firstValueFrom(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
    );

    expect(feedEntry.feedUuid).toBe(feedUuid);
  }));

  it('should `feedUuid` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        feedUuid: 0,
      }),
    );

    await expectAsync(
      firstValueFrom(
        feedEntryService.get('123e4567-e89b-12d3-a456-426614174000'),
      ),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should get languages', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        languages: ['ENG', 'JPN'],
      }),
    );

    const languages = await firstValueFrom(feedEntryService.getLanguages());

    expect(languages).toEqual(['ENG', 'JPN']);
  }));

  it('should get languages of ISO636-3 kind', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        languages: ['ENG', 'JPN'],
      }),
    );

    const languages = await firstValueFrom(
      feedEntryService.getLanguages('iso639_3'),
    );

    expect(languages).toEqual(['ENG', 'JPN']);
  }));

  it('should get languages of ISO636-1 kind', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        languages: ['EN', 'JA'],
      }),
    );

    const languages = await firstValueFrom(
      feedEntryService.getLanguages('iso639_1'),
    );

    expect(languages).toEqual(['EN', 'JA']);
  }));

  it('should get languages of name kind', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        languages: ['ENGLISH', 'JAPANESE'],
      }),
    );

    const languages = await firstValueFrom(
      feedEntryService.getLanguages('name'),
    );

    expect(languages).toEqual(['ENGLISH', 'JAPANESE']);
  }));
});
