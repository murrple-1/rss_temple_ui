import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { formatISO as formatDateISO, parseISO as parseDateISO } from 'date-fns';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

import { ZFeedEntry } from '@app/models/feedentry';
import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { FeedEntryService } from './feedentry.service';

const UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('FeedEntryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
          },
        },
        {
          provide: MOCK_COOKIE_SERVICE_CONFIG,
          useValue: {},
        },
        {
          provide: CookieService,
          useClass: MockCookieService,
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    });
  });

  afterEach(() => {
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.verify();
  });

  it('should get', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const feedPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({});

    const feed = await feedPromise;
    expect(ZFeedEntry.safeParse(feed).success).toBeTrue();
  }));

  it('should query', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const feedEntriesPromise = firstValueFrom(feedEntryService.query());

    const req = httpTesting.expectOne(
      r => r.method === 'POST' && /\/api\/feedentries\/query/.test(r.url),
    );
    req.flush({
      totalCount: 0,
      objects: [],
    });

    const feedEntries = await feedEntriesPromise;
    expect(feedEntries.objects).toBeDefined();
  }));

  it('should queryAll', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const feedEntriesPromise = firstValueFrom(feedEntryService.queryAll());

    const reqs = httpTesting.match(
      r => r.method === 'POST' && /\/api\/feedentries\/query/.test(r.url),
    );
    expect(reqs.length).toBe(1);
    for (const req of reqs) {
      req.flush({
        totalCount: 0,
        objects: [],
      });
    }

    const feedEntries = await feedEntriesPromise;
    expect(feedEntries.objects).toBeDefined();
  }));

  it('should read', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const readPromise = firstValueFrom(feedEntryService.read(UUID), {
      defaultValue: undefined,
    });

    const req = httpTesting.expectOne({
      url: `/api/feedentry/${UUID}/read`,
      method: 'POST',
    });
    req.flush(formatDateISO(new Date()));

    await expectAsync(readPromise).toBeResolved();
  }));

  it('should unread', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const unreadPromise = firstValueFrom(feedEntryService.unread(UUID), {
      defaultValue: undefined,
    });

    const req = httpTesting.expectOne({
      url: `/api/feedentry/${UUID}/read`,
      method: 'DELETE',
    });
    req.flush(null);

    await expectAsync(unreadPromise).toBeResolved();
  }));

  it('should readSome', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const readPromise = firstValueFrom(
      feedEntryService.readSome(
        [
          '123e4567-e89b-12d3-a456-426614174020',
          '123e4567-e89b-12d3-a456-426614174021',
        ],
        [
          '123e4567-e89b-12d3-a456-426614174022',
          '123e4567-e89b-12d3-a456-426614174023',
        ],
      ),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/feedentries/read',
      method: 'POST',
    });
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        feedEntryUuids: jasmine.arrayContaining([jasmine.any(String)]),
      }),
    );
    expect(req.request.body.feedEntryUuids.length).toBe(2);
    req.flush(null);

    await expectAsync(readPromise).toBeResolved();
  }));

  it('should unreadSome', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const unreadPromise = firstValueFrom(
      feedEntryService.unreadSome([
        '123e4567-e89b-12d3-a456-426614174020',
        '123e4567-e89b-12d3-a456-426614174021',
      ]),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/feedentries/read',
      method: 'DELETE',
    });
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        feedEntryUuids: jasmine.arrayContaining([jasmine.any(String)]),
      }),
    );
    expect(req.request.body.feedEntryUuids.length).toBe(2);
    req.flush(null);

    await expectAsync(unreadPromise).toBeResolved();
  }));

  it('should favorite', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const favoritePromise = firstValueFrom(feedEntryService.favorite(UUID), {
      defaultValue: undefined,
    });

    const req = httpTesting.expectOne({
      url: `/api/feedentry/${UUID}/favorite`,
      method: 'POST',
    });
    req.flush(null);

    await expectAsync(favoritePromise).toBeResolved();
  }));

  it('should unfavorite', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const unfavoritePromise = firstValueFrom(
      feedEntryService.unfavorite(UUID),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: `/api/feedentry/${UUID}/favorite`,
      method: 'DELETE',
    });
    req.flush(null);

    await expectAsync(unfavoritePromise).toBeResolved();
  }));

  it('should favoriteSome', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const favoritePromise = firstValueFrom(
      feedEntryService.favoriteSome([
        '123e4567-e89b-12d3-a456-426614174020',
        '123e4567-e89b-12d3-a456-426614174021',
      ]),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: `/api/feedentries/favorite`,
      method: 'POST',
    });
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        feedEntryUuids: jasmine.arrayContaining([jasmine.any(String)]),
      }),
    );
    expect(req.request.body.feedEntryUuids.length).toBe(2);
    req.flush(null);

    await expectAsync(favoritePromise).toBeResolved();
  }));

  it('should unfavoriteSome', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const unfavoritePromise = firstValueFrom(
      feedEntryService.unfavoriteSome([
        '123e4567-e89b-12d3-a456-426614174020',
        '123e4567-e89b-12d3-a456-426614174021',
      ]),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: `/api/feedentries/favorite`,
      method: 'DELETE',
    });
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        feedEntryUuids: jasmine.arrayContaining([jasmine.any(String)]),
      }),
    );
    expect(req.request.body.feedEntryUuids.length).toBe(2);
    req.flush(null);

    await expectAsync(unfavoritePromise).toBeResolved();
  }));

  it('should fail get when response is not JSON object', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush(4);

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const uuid = UUID;

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      uuid,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.uuid).toBe(uuid);
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      uuid: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `id`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const id = 'some-id';

    let feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    let req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      id,
    });

    let feedEntry = await feedEntryPromise;
    expect(feedEntry.id).toBe(id);

    feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      id: null,
    });

    feedEntry = await feedEntryPromise;
    expect(feedEntry.id).toBeNull();
  }));

  it('should `id` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      id: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `createdAt`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const createdAt = parseDateISO('2020-01-01T00:00:00');

    let feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    let req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      createdAt: formatDateISO(createdAt),
    });

    let feedEntry = await feedEntryPromise;
    expect(feedEntry.createdAt).toEqual(createdAt);

    feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      createdAt: null,
    });

    feedEntry = await feedEntryPromise;
    expect(feedEntry.createdAt).toBeNull();
  }));

  it('should `createdAt` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      createdAt: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `createdAt` malformed', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      createdAt: 'bad datetime',
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `publishedAt`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const publishedAt = parseDateISO('2020-01-01T00:00:00');

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      publishedAt: formatDateISO(publishedAt),
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.publishedAt).toEqual(publishedAt);
  }));

  it('should `publishedAt` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      publishedAt: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `publishedAt` malformed', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      publishedAt: 'bad datetime',
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `updatedAt`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const updatedAt = parseDateISO('2020-01-01T00:00:00');

    let feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    let req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      updatedAt: formatDateISO(updatedAt),
    });

    let feedEntry = await feedEntryPromise;
    expect(feedEntry.updatedAt).toEqual(updatedAt);

    feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      updatedAt: null,
    });

    feedEntry = await feedEntryPromise;
    expect(feedEntry.updatedAt).toBeNull();
  }));

  it('should `updatedAt` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      updatedAt: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `updatedAt` malformed', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      updatedAt: 'bad datetime',
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `title`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const title = 'A Title';

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      title,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.title).toBe(title);
  }));

  it('should `title` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      title: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `url`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const url = 'http://www.fake.com/entry/1';

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      url,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.url).toBe(url);
  }));

  it('should `url` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      url: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `content`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const content = '<div>Some Content</div>';

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      content,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.content).toBe(content);
  }));

  it('should `content` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    let p = firstValueFrom(feedEntryService.get(UUID));

    let req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      content: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);

    p = firstValueFrom(feedEntryService.get(UUID));

    req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      content: null,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `authorName`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const authorName = 'John Doe';

    let feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    let req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      authorName,
    });

    let feedEntry = await feedEntryPromise;
    expect(feedEntry.authorName).toBe(authorName);

    feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      authorName: null,
    });

    feedEntry = await feedEntryPromise;
    expect(feedEntry.authorName).toBeNull();
  }));

  it('should `authorName` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      authorName: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `isFromSubscription`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const isFromSubscription = true;

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      isFromSubscription,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.isFromSubscription).toBe(isFromSubscription);
  }));

  it('should `isFromSubscription` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      isFromSubscription: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `isRead`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const isRead = true;

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      isRead,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.isRead).toBe(isRead);
  }));

  it('should `isRead` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      isRead: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `isFavorite`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const isFavorite = true;

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      isFavorite,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.isFavorite).toBe(isFavorite);
  }));

  it('should `isFavorite` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      isFavorite: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `feedUuid`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const feedUuid = '123e4567-e89b-12d3-a456-426614174020';

    const feedEntryPromise = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      feedUuid,
    });

    const feedEntry = await feedEntryPromise;
    expect(feedEntry.feedUuid).toBe(feedUuid);
  }));

  it('should `feedUuid` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const p = firstValueFrom(feedEntryService.get(UUID));

    const req = httpTesting.expectOne(
      r =>
        r.method === 'GET' && new RegExp(`/api/feedentry/${UUID}`).test(r.url),
    );
    req.flush({
      feedUuid: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should get languages', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const languagesExpect = ['ENG', 'JPN'];

    const languagesPromise = firstValueFrom(feedEntryService.getLanguages());

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feedentry\/languages/.test(r.url),
    );
    req.flush({
      languages: languagesExpect,
    });

    const languages = await languagesPromise;
    expect(languages).toEqual(languagesExpect);
  }));

  it('should get languages of ISO636-3 kind', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const languagesExpect = ['ENG', 'JPN'];

    const languagesPromise = firstValueFrom(
      feedEntryService.getLanguages('iso639_3'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feedentry\/languages/.test(r.url),
    );
    req.flush({
      languages: languagesExpect,
    });

    const languages = await languagesPromise;
    expect(languages).toEqual(languagesExpect);
  }));

  it('should get languages of ISO636-1 kind', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const languagesExpect = ['EN', 'JA'];

    const languagesPromise = firstValueFrom(
      feedEntryService.getLanguages('iso639_1'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feedentry\/languages/.test(r.url),
    );
    req.flush({
      languages: languagesExpect,
    });

    const languages = await languagesPromise;
    expect(languages).toEqual(languagesExpect);
  }));

  it('should get languages of name kind', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedEntryService = TestBed.inject(FeedEntryService);

    const languagesExpect = ['ENGLISH', 'JAPANESE'];

    const languagesPromise = firstValueFrom(
      feedEntryService.getLanguages('name'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feedentry\/languages/.test(r.url),
    );
    req.flush({
      languages: languagesExpect,
    });

    const languages = await languagesPromise;
    expect(languages).toEqual(languagesExpect);
  }));
});
