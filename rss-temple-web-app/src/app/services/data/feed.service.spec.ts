import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { formatISO as formatDateISO, parse as parseDate } from 'date-fns';
import { firstValueFrom, of } from 'rxjs';
import { z } from 'zod';

import { ZFeed } from '@app/models/feed';
import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { FeedService } from './feed.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'delete',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const feedService = new FeedService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    feedService,
  };
}

describe('FeedService', () => {
  it('should get', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(ZFeed.safeParse(feed).success).toBeTrue();
  }));

  it('should query', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const feeds = await firstValueFrom(feedService.query());

    expect(feeds.objects).toBeDefined();
  }));

  it('should queryAll', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const feeds = await firstValueFrom(feedService.queryAll());

    expect(feeds.objects).toBeDefined();
  }));

  it('should subscribe', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(feedService.subscribe('http://www.fake.com/rss.xml'), {
      defaultValue: undefined,
    });

    expect().nothing();
  }));

  it('should subscribe with custom title', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      feedService.subscribe('http://www.fake.com/rss.xml', 'Custom Title'),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should unsubscribe', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await firstValueFrom(
      feedService.unsubscribe('http://www.fake.com/rss.xml'),
      { defaultValue: undefined },
    );

    expect().nothing();
  }));

  it('should fail get when response is not JSON object', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(of(4));

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const uuid = '123e4567-e89b-12d3-a456-426614174000';

    httpClientSpy.get.and.returnValue(
      of({
        uuid,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.uuid).toBe(uuid);
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `title`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const title = 'A Title';

    httpClientSpy.get.and.returnValue(
      of({
        title,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.title).toBe(title);
  }));

  it('should `title` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        title: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `feedUrl`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const feedUrl = 'http://www.fake.com/rss.xml';

    httpClientSpy.get.and.returnValue(
      of({
        feedUrl,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.feedUrl).toBe(feedUrl);
  }));

  it('should `feedUrl` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        feedUrl: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `homeUrl`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const homeUrl = 'http://www.fake.com/rss.xml';

    httpClientSpy.get.and.returnValue(
      of({
        homeUrl,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.homeUrl).toBe(homeUrl);
  }));

  it('should `homeUrl` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        homeUrl: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `publishedAt`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const publishedAt = parseDate(
      '2020-01-01 00:00:00',
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: formatDateISO(publishedAt),
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.publishedAt).toEqual(publishedAt);
  }));

  it('should `publishedAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `publishedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 'bad datetime',
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `updatedAt`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const updatedAt = parseDate(
      '2020-01-01 00:00:00',
      'yyyy-MM-dd HH:mm:ss',
      new Date(),
    );

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: formatDateISO(updatedAt),
      }),
    );

    let feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.updatedAt).toEqual(updatedAt);

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: null,
      }),
    );

    feed = await firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    expect(feed.updatedAt).toBeNull();
  }));

  it('should `updatedAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `updatedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 'bad datetime',
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `isSubscribed`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const isSubscribed = false;

    httpClientSpy.get.and.returnValue(
      of({
        isSubscribed,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.isSubscribed).toBe(isSubscribed);
  }));

  it('should `isSubscribed` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        isSubscribed: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `customTitle`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const customTitle = 'Custom Title';

    httpClientSpy.get.and.returnValue(
      of({
        customTitle,
      }),
    );

    let feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.customTitle).toBe(customTitle);

    httpClientSpy.get.and.returnValue(
      of({
        customTitle: null,
      }),
    );

    feed = await firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    expect(feed.customTitle).toBeNull();
  }));

  it('should `customTitle` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        customTitle: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `calculatedTitle`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const calculatedTitle = 'A Calculated Title';

    httpClientSpy.get.and.returnValue(
      of({
        calculatedTitle,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.calculatedTitle).toBe(calculatedTitle);
  }));

  it('should `calculatedTitle` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        calculatedTitle: 0,
      }),
    );

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `userCategoryUuids`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const userCategoryUuids = ['123e4567-e89b-12d3-a456-426614174000'];

    httpClientSpy.get.and.returnValue(
      of({
        userCategoryUuids,
      }),
    );

    const feed = await firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    expect(feed.userCategoryUuids).toEqual(userCategoryUuids);
  }));

  it('should `userCategoryUuids` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        userCategoryUuids: 0,
      }),
    );

    const p1 = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p1).toBeRejected();
    await expectAsync(
      p1.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);

    httpClientSpy.get.and.returnValue(
      of({
        userCategoryUuids: [0],
      }),
    );

    const p2 = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    await expectAsync(p2).toBeRejected();
    await expectAsync(
      p2.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));
});
