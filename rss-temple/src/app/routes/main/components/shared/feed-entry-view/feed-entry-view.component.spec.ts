import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DateFormatPipe } from '@app/pipes/dayjs-format.pipe';
import { ReadCounterService } from '@app/routes/main/services';
import { FeedEntryService } from '@app/services/data';

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

  await TestBed.configureTestingModule({
    declarations: [FeedEntryViewComponent, DateFormatPipe],
    providers: [
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
      {
        provide: ReadCounterService,
        useValue: mockReadCounterService,
      },
    ],
  }).compileComponents();

  return {
    routerSpy,

    mockFeedEntryService,
    mockReadCounterService,
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
