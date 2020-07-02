import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { FeedEntry } from '@app/models';

import { FeedEntryService } from './feedentry.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'delete',
    'request',
  ]);

  const feedEntryService = new FeedEntryService(httpClientSpy);

  return {
    httpClientSpy,

    feedEntryService,
  };
}

describe('FeedEntryService', () => {
  it('should get', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const feed = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feed).toBeInstanceOf(FeedEntry);
  }));

  it('should query', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const feeds = await feedEntryService.query().toPromise();

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

    const feeds = await feedEntryService.queryAll().toPromise();

    expect(feeds.objects).toBeDefined();
  }));

  it('should read', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await feedEntryService
      .read('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect().nothing();
  }));

  it('should unread', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await feedEntryService
      .unread('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect().nothing();
  }));

  it('should readSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await feedEntryService
      .readSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ])
      .toPromise();

    expect().nothing();
  }));

  it('should unreadSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.request.and.returnValue(of());

    await feedEntryService
      .unreadSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ])
      .toPromise();

    expect().nothing();
  }));

  it('should favorite', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await feedEntryService
      .favorite('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect().nothing();
  }));

  it('should unfavorite', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await feedEntryService
      .unfavorite('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect().nothing();
  }));

  it('should favoriteSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await feedEntryService
      .favoriteSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ])
      .toPromise();

    expect().nothing();
  }));

  it('should unfavoriteSome', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.request.and.returnValue(of());

    await feedEntryService
      .unfavoriteSome([
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ])
      .toPromise();

    expect().nothing();
  }));

  it('should fail get when response is not JSON object', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(of(4));

    await expectAsync(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, 'JSON must be object');
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const uuid = '123e4567-e89b-12d3-a456-426614174000';

    httpClientSpy.get.and.returnValue(
      of({
        uuid,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /uuid.*?must be string/);
  }));

  it('should `id`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const id = 'some-id';

    httpClientSpy.get.and.returnValue(
      of({
        id,
      }),
    );

    let feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feedEntry.id).toBe(id);

    httpClientSpy.get.and.returnValue(
      of({
        id: null,
      }),
    );

    feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /id.*?must be string/);
  }));

  it('should `createdAt`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const createdAt = dayjs('2020-01-01 00:00:00', {
      format: 'YYYY-MM-DD HH:mm:ss',
      utc: true,
    });

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: createdAt.format('YYYY-MM-DD HH:mm:ss'),
      }),
    );

    let feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feedEntry.createdAt).toEqual(createdAt);

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: null,
      }),
    );

    feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /createdAt.*?must be datetime or null/);
  }));

  it('should `createdAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        createdAt: 'bad datetime',
      }),
    );

    await expectAsync(
      feedEntryService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /createdAt.*?invalid/);
  }));

  it('should `publishedAt`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const publishedAt = dayjs('2020-01-01 00:00:00', {
      format: 'YYYY-MM-DD HH:mm:ss',
      utc: true,
    });

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: publishedAt.format('YYYY-MM-DD HH:mm:ss'),
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /publishedAt.*?must be datetime/);
  }));

  it('should `publishedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 'bad datetime',
      }),
    );

    await expectAsync(
      feedEntryService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /publishedAt.*?invalid/);
  }));

  it('should `updatedAt`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const updatedAt = dayjs('2020-01-01 00:00:00', {
      format: 'YYYY-MM-DD HH:mm:ss',
      utc: true,
    });

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: updatedAt.format('YYYY-MM-DD HH:mm:ss'),
      }),
    );

    let feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feedEntry.updatedAt).toEqual(updatedAt);

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: null,
      }),
    );

    feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /updatedAt.*?must be datetime or null/);
  }));

  it('should `updatedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 'bad datetime',
      }),
    );

    await expectAsync(
      feedEntryService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /updatedAt.*?invalid/);
  }));

  it('should `title`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const title = 'A Title';

    httpClientSpy.get.and.returnValue(
      of({
        title,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /title.*?must be string/);
  }));

  it('should `url`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const url = 'http://www.fake.com/entry/1';

    httpClientSpy.get.and.returnValue(
      of({
        url,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /url.*?must be string/);
  }));

  it('should `content`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const content = '<div>Some Content</div>';

    httpClientSpy.get.and.returnValue(
      of({
        content,
      }),
    );

    let feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feedEntry.content).toBe(content);

    httpClientSpy.get.and.returnValue(
      of({
        content: null,
      }),
    );

    feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feedEntry.content).toBeNull();
  }));

  it('should `content` type error', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        content: 0,
      }),
    );

    await expectAsync(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /content.*?must be string/);
  }));

  it('should `authorName`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const authorName = 'John Doe';

    httpClientSpy.get.and.returnValue(
      of({
        authorName,
      }),
    );

    let feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(feedEntry.authorName).toBe(authorName);

    httpClientSpy.get.and.returnValue(
      of({
        authorName: null,
      }),
    );

    feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /authorName.*?must be string or null/);
  }));

  it('should `fromSubscription`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const fromSubscription = true;

    httpClientSpy.get.and.returnValue(
      of({
        fromSubscription,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /fromSubscription.*?must be boolean/);
  }));

  it('should `isRead`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const isRead = true;

    httpClientSpy.get.and.returnValue(
      of({
        isRead,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /isRead.*?must be boolean/);
  }));

  it('should `isFavorite`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const isFavorite = true;

    httpClientSpy.get.and.returnValue(
      of({
        isFavorite,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /isFavorite.*?must be boolean/);
  }));

  it('should `feedUuid`', fakeAsync(async () => {
    const { httpClientSpy, feedEntryService } = setup();

    const feedUuid = '123e4567-e89b-12d3-a456-426614174000';

    httpClientSpy.get.and.returnValue(
      of({
        feedUuid,
      }),
    );

    const feedEntry = await feedEntryService
      .get('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

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
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /feedUuid.*?must be string/);
  }));
});
