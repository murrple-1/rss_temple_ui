import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import {
  FeedEntryVoteService,
  ReadCounterService,
} from '@app/routes/main/services';
import { ClassifierLabelService, FeedEntryService } from '@app/services/data';

import { FeedEntryViewComponent } from './feed-entry-view.component';

describe('FeedEntryViewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedEntryViewComponent, DateFormatPipe],
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>('Router', ['navigate']),
        },
        {
          provide: FeedEntryService,
          useValue: jasmine.createSpyObj<FeedEntryService>('FeedEntryService', [
            'query',
            'readSome',
            'unreadSome',
          ]),
        },
        {
          provide: ClassifierLabelService,
          useValue: jasmine.createSpyObj<ClassifierLabelService>(
            'ClassifierLabelService',
            ['getAll'],
          ),
        },
        {
          provide: ReadCounterService,
          useValue: jasmine.createSpyObj<ReadCounterService>(
            'ReadCounterService',
            ['readAll'],
          ),
        },
        {
          provide: FeedEntryVoteService,
          useValue: jasmine.createSpyObj<FeedEntryVoteService>(
            'FeedEntryVoteService',
            ['shouldForceLabelVote'],
          ),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(FeedEntryViewComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
