import { TestBed, waitForAsync } from '@angular/core/testing';

import { FeedEntryService } from '@app/services/data';
import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import { FeedCountsObservableService } from '@app/routes/main/services';

import { FeedEntryViewComponent } from './feed-entry-view.component';

async function setup() {
  const mockFeedCountsObservableService = jasmine.createSpyObj<FeedCountsObservableService>(
    'FeedCountsObservableService',
    ['refresh'],
  );
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'read', 'unread'],
  );

  await TestBed.configureTestingModule({
    declarations: [FeedEntryViewComponent, DateFormatPipe],
    providers: [
      {
        provide: FeedCountsObservableService,
        useValue: mockFeedCountsObservableService,
      },
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
    ],
  }).compileComponents();

  return {
    mockFeedEntryService,
  };
}

describe('FeedEntryViewComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedEntryViewComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
