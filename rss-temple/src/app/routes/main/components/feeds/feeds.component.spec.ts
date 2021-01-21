import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { MockActivatedRoute } from '@app/test/activatedroute.mock';
import { FeedService, FeedEntryService } from '@app/services/data';
import {
  FeedObservableService,
  DisplayObservableService,
} from '@app/routes/main/services';
import { DisplayOptionsViewComponent } from '@app/routes/main/components/shared/display-options/display-options.component';

import { FeedsComponent } from './feeds.component';

async function setup() {
  const mockRoute = new MockActivatedRoute();

  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
  ]);
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'read', 'unread'],
  );

  await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes([])],
    declarations: [FeedsComponent, DisplayOptionsViewComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: mockRoute,
      },

      FeedObservableService,
      DisplayObservableService,
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
    ],
  }).compileComponents();

  return {
    mockRoute,

    mockFeedService,
    mockFeedEntryService,
  };
}

describe('FeedsComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedsComponent);
      const component = componentFixture.debugElement
        .componentInstance as FeedsComponent;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      const { mockFeedService, mockFeedEntryService } = await setup();
      mockFeedService.queryAll.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );
      mockFeedEntryService.query.and.returnValue(
        of({
          objects: [],
          totalCount: 0,
        }),
      );

      const componentFixture = TestBed.createComponent(FeedsComponent);
      const component = componentFixture.debugElement
        .componentInstance as FeedsComponent;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  // TODO more tests
});
