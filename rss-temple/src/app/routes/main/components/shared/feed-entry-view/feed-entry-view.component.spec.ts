import { TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayObservableService } from '@app/routes/main/services';
import { FeedEntryService } from '@app/services/data';

import { FeedEntryViewComponent } from './feed-entry-view.component';

async function setup() {
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'read', 'unread'],
  );

  await TestBed.configureTestingModule({
    declarations: [FeedEntryViewComponent],
    providers: [
      DisplayObservableService,
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
      const component = componentFixture.debugElement
        .componentInstance as FeedEntryViewComponent;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
