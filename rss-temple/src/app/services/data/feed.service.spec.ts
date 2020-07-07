import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { Feed } from '@app/models';

import { FeedService } from './feed.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'delete',
  ]);

  const feedService = new FeedService(httpClientSpy);

  return {
    httpClientSpy,

    feedService,
  };
}

describe('FeedService', () => {
  it('should get', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(of({}));

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed).toBeInstanceOf(Feed);
  }));

  it('should query', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(
      of({
        totalCount: 0,
        objects: [],
      }),
    );

    const feeds = await feedService.query().toPromise();

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

    const feeds = await feedService.queryAll().toPromise();

    expect(feeds.objects).toBeDefined();
  }));

  it('should subscribe', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await feedService.subscribe('http://www.fake.com/rss.xml').toPromise();

    expect().nothing();
  }));

  it('should subscribe with custom title', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await feedService
      .subscribe('http://www.fake.com/rss.xml', 'Custom Title')
      .toPromise();

    expect().nothing();
  }));

  it('should unsubscribe', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.delete.and.returnValue(of());

    await feedService.unsubscribe('http://www.fake.com/rss.xml').toPromise();

    expect().nothing();
  }));

  it('should fail get when response is not JSON object', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(of(4));

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, 'JSON must be object');
  }));

  it('should `uuid`', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const uuid = '123e4567-e89b-12d3-a456-426614174000';

    httpClientSpy.get.and.returnValue(
      of({
        uuid,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.uuid).toBe(uuid);
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /uuid.*?must be string/);
  }));

  it('should `title', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const title = 'A Title';

    httpClientSpy.get.and.returnValue(
      of({
        title,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.title).toBe(title);
  }));

  it('should `title` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        title: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /title.*?must be string/);
  }));

  it('should `feedUrl', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const feedUrl = 'http://www.fake.com/rss.xml';

    httpClientSpy.get.and.returnValue(
      of({
        feedUrl,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.feedUrl).toBe(feedUrl);
  }));

  it('should `feedUrl` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        feedUrl: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /feedUrl.*?must be string/);
  }));

  it('should `homeUrl', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const homeUrl = 'http://www.fake.com/rss.xml';

    httpClientSpy.get.and.returnValue(
      of({
        homeUrl,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.homeUrl).toBe(homeUrl);
  }));

  it('should `homeUrl` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        homeUrl: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /homeUrl.*?must be string/);
  }));

  it('should `publishedAt', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const publishedAt = dayjs('2020-01-01 00:00:00', {
      format: 'YYYY-MM-DD HH:mm:ss',
      utc: true,
    });

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: publishedAt.format('YYYY-MM-DD HH:mm:ss'),
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.publishedAt).toEqual(publishedAt);
  }));

  it('should `publishedAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /publishedAt.*?must be datetime/);
  }));

  it('should `publishedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        publishedAt: 'bad datetime',
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /publishedAt.*?invalid/);
  }));

  it('should `updatedAt', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const updatedAt = dayjs('2020-01-01 00:00:00', {
      format: 'YYYY-MM-DD HH:mm:ss',
      utc: true,
    });

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: updatedAt.format('YYYY-MM-DD HH:mm:ss'),
      }),
    );

    let feed = await feedService.get('http://www.fake.com/rss.xml').toPromise();

    expect(feed.updatedAt).toEqual(updatedAt);

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: null,
      }),
    );

    feed = await feedService.get('http://www.fake.com/rss.xml').toPromise();

    expect(feed.updatedAt).toBeNull();
  }));

  it('should `updatedAt` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /updatedAt.*?must be datetime/);
  }));

  it('should `updatedAt` malformed', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        updatedAt: 'bad datetime',
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /updatedAt.*?invalid/);
  }));

  it('should `subscribed', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const subscribed = false;

    httpClientSpy.get.and.returnValue(
      of({
        subscribed,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.subscribed).toBe(subscribed);
  }));

  it('should `subscribed` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        subscribed: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /subscribed.*?must be boolean/);
  }));

  it('should `customTitle', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const customTitle = 'Custom Title';

    httpClientSpy.get.and.returnValue(
      of({
        customTitle,
      }),
    );

    let feed = await feedService.get('http://www.fake.com/rss.xml').toPromise();

    expect(feed.customTitle).toBe(customTitle);

    httpClientSpy.get.and.returnValue(
      of({
        customTitle: null,
      }),
    );

    feed = await feedService.get('http://www.fake.com/rss.xml').toPromise();

    expect(feed.customTitle).toBeNull();
  }));

  it('should `customTitle` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        customTitle: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /customTitle.*?must be string or null/);
  }));

  it('should `calculatedTitle', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const calculatedTitle = 'A Calculated Title';

    httpClientSpy.get.and.returnValue(
      of({
        calculatedTitle,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.calculatedTitle).toBe(calculatedTitle);
  }));

  it('should `calculatedTitle` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        calculatedTitle: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /calculatedTitle.*?must be string/);
  }));

  it('should `userCategoryUuids', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    const userCategoryUuids = ['123e4567-e89b-12d3-a456-426614174000'];

    httpClientSpy.get.and.returnValue(
      of({
        userCategoryUuids,
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(feed.userCategoryUuids).toBe(userCategoryUuids);
  }));

  it('should `userCategoryUuids` type error', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        userCategoryUuids: 0,
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(Error, /userCategoryUuids.*?must be array/);

    httpClientSpy.get.and.returnValue(
      of({
        userCategoryUuids: [0],
      }),
    );

    await expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(
      Error,
      /userCategoryUuids.*?element.*?must be string/,
    );
  }));
});
