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

describe('feedentry.service', () => {
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

  it('should fail get when response is not JSON object', fakeAsync(() => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(of(4));

    expectAsync(
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

  it('should `uuid` type error', fakeAsync(() => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        uuid: 0,
      }),
    );

    expectAsync(
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

  it('should `id` type error', fakeAsync(() => {
    const { httpClientSpy, feedEntryService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        id: 0,
      }),
    );

    expectAsync(
      feedEntryService.get('123e4567-e89b-12d3-a456-426614174000').toPromise(),
    ).toBeRejectedWithError(Error, /id.*?must be string/);
  }));
});
