import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SnackbarModule } from 'ngx-snackbar';

import { FeedService, FeedEntryService } from '@app/services/data';
import {
  FeedObservableService,
  DisplayObservableService,
} from '@app/routes/main/services';
import { DisplayOptionsViewComponent } from '@app/routes/main/components/shared/display-options/display-options.component';

import { FeedsComponent } from './feeds.component';

async function setup() {
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'queryAll',
  ]);
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'read', 'unread'],
  );

  await TestBed.configureTestingModule({
    imports: [SnackbarModule.forRoot(), RouterTestingModule.withRoutes([])],
    declarations: [FeedsComponent, DisplayOptionsViewComponent],
    providers: [
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
    mockFeedService,
    mockFeedEntryService,
  };
}

describe('FeedsComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(FeedsComponent);
    const component = componentFixture.debugElement
      .componentInstance as FeedsComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
