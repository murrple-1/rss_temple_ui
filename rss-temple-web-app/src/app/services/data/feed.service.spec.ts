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

import { ZFeed } from '@app/models/feed';
import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';
import {
  MOCK_COOKIE_SERVICE_CONFIG,
  MockCookieService,
} from '@app/test/cookie.service.mock';

import { FeedService } from './feed.service';

describe('FeedService', () => {
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
    const feedService = TestBed.inject(FeedService);

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({});

    const feed = await feedPromise;
    expect(ZFeed.safeParse(feed).success).toBeTrue();
  }));

  it('should query', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const feedsPromise = firstValueFrom(feedService.query());

    const req = httpTesting.expectOne(
      r => r.method === 'POST' && /\/api\/feeds\/query/.test(r.url),
    );
    req.flush({
      totalCount: 0,
      objects: [],
    });

    const feeds = await feedsPromise;
    expect(feeds.objects).toBeDefined();
  }));

  it('should queryAll', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const feedsPromise = firstValueFrom(feedService.queryAll());

    const reqs = httpTesting.match(
      r => r.method === 'POST' && /\/api\/feeds\/query/.test(r.url),
    );
    expect(reqs.length).toBe(1);
    for (const req of reqs) {
      req.flush({
        totalCount: 0,
        objects: [],
      });
    }

    const feeds = await feedsPromise;
    expect(feeds.objects).toBeDefined();
  }));

  it('should subscribe', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const subscribePromise = firstValueFrom(
      feedService.subscribe('http://www.fake.com/rss.xml'),
      {
        defaultValue: undefined,
      },
    );

    const req = httpTesting.expectOne({
      url: '/api/feed/subscribe',
      method: 'POST',
    });
    expect(req.request.body).toEqual({
      url: jasmine.any(String),
      customTitle: undefined,
    });
    req.flush(null);

    await expectAsync(subscribePromise).toBeResolved();
  }));

  it('should subscribe with custom title', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const subscribePromise = firstValueFrom(
      feedService.subscribe('http://www.fake.com/rss.xml', 'Custom Title'),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/feed/subscribe',
      method: 'POST',
    });
    expect(req.request.body).toEqual({
      url: jasmine.any(String),
      customTitle: jasmine.any(String),
    });
    req.flush(null);

    await expectAsync(subscribePromise).toBeResolved();
  }));

  it('should unsubscribe', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const unsubscribePromise = firstValueFrom(
      feedService.unsubscribe('http://www.fake.com/rss.xml'),
      { defaultValue: undefined },
    );

    const req = httpTesting.expectOne({
      url: '/api/feed/subscribe',
      method: 'DELETE',
    });
    expect(req.request.body).toEqual({
      url: jasmine.any(String),
    });
    req.flush(null);

    await expectAsync(unsubscribePromise).toBeResolved();
  }));

  it('should fail get when response is not JSON object', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush(4);

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `uuid`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const uuid = '123e4567-e89b-12d3-a456-426614174000';

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      uuid,
    });

    const feed = await feedPromise;
    expect(feed.uuid).toBe(uuid);
  }));

  it('should `uuid` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      uuid: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `title`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const title = 'A Title';

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      title,
    });

    const feed = await feedPromise;
    expect(feed.title).toBe(title);
  }));

  it('should `title` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      title: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `feedUrl`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const feedUrl = 'http://www.fake.com/rss.xml';

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      feedUrl,
    });

    const feed = await feedPromise;
    expect(feed.feedUrl).toBe(feedUrl);
  }));

  it('should `feedUrl` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      feedUrl: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `homeUrl`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const homeUrl = 'http://www.fake.com/rss.xml';

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      homeUrl,
    });

    const feed = await feedPromise;
    expect(feed.homeUrl).toBe(homeUrl);
  }));

  it('should `homeUrl` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      homeUrl: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `publishedAt`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const publishedAt = parseDateISO('2020-01-01T00:00:00');

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      publishedAt: formatDateISO(publishedAt),
    });

    const feed = await feedPromise;
    expect(feed.publishedAt).toEqual(publishedAt);
  }));

  it('should `publishedAt` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
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
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
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
    const feedService = TestBed.inject(FeedService);

    const updatedAt = parseDateISO('2020-01-01T00:00:00');

    let feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    let req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      updatedAt: formatDateISO(updatedAt),
    });

    let feed = await feedPromise;
    expect(feed.updatedAt).toEqual(updatedAt);

    feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      updatedAt: null,
    });

    feed = await feedPromise;
    expect(feed.updatedAt).toBeNull();
  }));

  it('should `updatedAt` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
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
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      updatedAt: 'bad datetime',
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `isSubscribed`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const isSubscribed = false;

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      isSubscribed,
    });

    const feed = await feedPromise;
    expect(feed.isSubscribed).toBe(isSubscribed);
  }));

  it('should `isSubscribed` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      isSubscribed: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `customTitle`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const customTitle = 'Custom Title';

    let feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    let req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      customTitle,
    });

    let feed = await feedPromise;
    expect(feed.customTitle).toBe(customTitle);

    feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      customTitle: null,
    });

    feed = await feedPromise;
    expect(feed.customTitle).toBeNull();
  }));

  it('should `customTitle` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      customTitle: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `calculatedTitle`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const calculatedTitle = 'A Calculated Title';

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      calculatedTitle,
    });

    const feed = await feedPromise;
    expect(feed.calculatedTitle).toBe(calculatedTitle);
  }));

  it('should `calculatedTitle` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const p = firstValueFrom(feedService.get('http://www.fake.com/rss.xml'));

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      calculatedTitle: 0,
    });

    await expectAsync(p).toBeRejected();
    await expectAsync(
      p.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));

  it('should `userCategoryUuids`', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    const userCategoryUuids = ['123e4567-e89b-12d3-a456-426614174000'];

    const feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    const req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      userCategoryUuids,
    });

    const feed = await feedPromise;
    expect(feed.userCategoryUuids).toEqual(userCategoryUuids);
  }));

  it('should `userCategoryUuids` type error', fakeAsync(async () => {
    const httpTesting = TestBed.inject(HttpTestingController);
    const feedService = TestBed.inject(FeedService);

    let feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    let req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      userCategoryUuids: 0,
    });

    await expectAsync(feedPromise).toBeRejected();
    await expectAsync(
      feedPromise.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);

    feedPromise = firstValueFrom(
      feedService.get('http://www.fake.com/rss.xml'),
    );

    req = httpTesting.expectOne(
      r => r.method === 'GET' && /\/api\/feed/.test(r.url),
    );
    req.flush({
      userCategoryUuids: [0],
    });

    await expectAsync(feedPromise).toBeRejected();
    await expectAsync(
      feedPromise.catch(reason => reason.constructor.name),
    ).toBeResolvedTo(z.ZodError.name);
  }));
});
