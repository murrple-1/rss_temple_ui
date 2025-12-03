import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { of } from 'rxjs';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { FeedEntryService, FeedService } from '@app/services/data';

import { SearchFeedsComponent } from './search-feeds.component';

describe('SearchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserModule,
        ClarityModule,
        RouterModule.forRoot([]),
        SearchFeedsComponent,
      ],
      providers: [
        {
          provide: FeedService,
          useValue: {
            query: vi.fn().mockName('FeedService.query'),
          },
        },
        {
          provide: FeedEntryService,
          useValue: {
            query: vi.fn().mockName('FeedEntryService.query'),
            getLanguages: vi.fn().mockName('FeedEntryService.getLanguages'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const mockFeedEntryService = TestBed.inject(
      FeedEntryService,
    ) as MockedObject<FeedEntryService>;
    mockFeedEntryService.query.mockReturnValue(
      of({
        objects: [],
      }),
    );
    mockFeedEntryService.getLanguages.mockReturnValue(
      of(['ENG', 'UND', 'JPN']),
    );

    const componentFixture = TestBed.createComponent(SearchFeedsComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
