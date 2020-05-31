import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

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

describe('feed.service', () => {
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

  it('should fail get when response is not JSON object', fakeAsync(() => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(of(4));

    expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(undefined, 'JSON must be object');
  }));

  it('should parse uuid', fakeAsync(async () => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      }),
    );

    const feed = await feedService
      .get('http://www.fake.com/rss.xml')
      .toPromise();

    expect(typeof feed.uuid).toBe('string');
  }));

  it('should fail parse if uuid is not string', fakeAsync(() => {
    const { httpClientSpy, feedService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 4,
      }),
    );

    expectAsync(
      feedService.get('http://www.fake.com/rss.xml').toPromise(),
    ).toBeRejectedWithError(undefined, /uuid.*?must be string/);
  }));
});
