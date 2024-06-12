import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';

import { FeedEntryService, FeedService } from '@app/services/data';

import { SearchEntriesComponent } from './search-entries.component';

async function setup() {
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'query',
  ]);
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query', 'getLanguages'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [SearchEntriesComponent],
    providers: [
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

describe('SearchComponent', () => {
  it('should create the component', waitForAsync(async () => {
    const { mockFeedEntryService } = await setup();
    mockFeedEntryService.query.and.returnValue(
      of({
        objects: [],
      }),
    );
    mockFeedEntryService.getLanguages.and.returnValue(
      of(['ENG', 'UND', 'JPN']),
    );

    const componentFixture = TestBed.createComponent(SearchEntriesComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
