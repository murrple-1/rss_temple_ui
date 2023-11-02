import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import {
  FeedEntryVoteService,
  ReadCounterService,
} from '@app/routes/main/services';
import { ClassifierLabelService, FeedEntryService } from '@app/services/data';

import { FeedEntryViewComponent } from './feed-entry-view.component';

async function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'readSome', 'unreadSome'],
  );
  const mockReadCounterService = jasmine.createSpyObj<ReadCounterService>(
    'ReadCounterService',
    ['readAll'],
  );
  const mockClassifierLabelService =
    jasmine.createSpyObj<ClassifierLabelService>('ClassifierLabelService', [
      'getAll',
    ]);
  const mockFeedEntryVoteService = jasmine.createSpyObj<FeedEntryVoteService>(
    'FeedEntryVoteService',
    ['shouldForceLabelVote'],
  );

  await TestBed.configureTestingModule({
    declarations: [FeedEntryViewComponent, DateFormatPipe],
    providers: [
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
      {
        provide: ClassifierLabelService,
        useValue: mockClassifierLabelService,
      },
      {
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
      {
        provide: FeedEntryVoteService,
        useValue: mockFeedEntryVoteService,
      },
    ],
  }).compileComponents();

  return {
    routerSpy,

    mockFeedEntryService,
    mockClassifierLabelService,
    mockReadCounterService,
    mockFeedEntryVoteService,
  };
}

describe('FeedEntryViewComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(FeedEntryViewComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
