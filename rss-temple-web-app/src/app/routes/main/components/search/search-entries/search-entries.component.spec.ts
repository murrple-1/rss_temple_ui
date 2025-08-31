import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';

import { FeedEntryService, FeedService } from '@app/services/data';

import { SearchEntriesComponent } from './search-entries.component';

describe('SearchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        SearchEntriesComponent,
      ],
      providers: [
        {
          provide: FeedService,
          useValue: jasmine.createSpyObj<FeedService>('FeedService', ['query']),
        },
        {
          provide: FeedEntryService,
          useValue: jasmine.createSpyObj<FeedEntryService>('FeedEntryService', [
            'query',
            'getLanguages',
          ]),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const mockFeedEntryService = TestBed.inject(
      FeedEntryService,
    ) as jasmine.SpyObj<FeedEntryService>;
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
