import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
          useValue: {
            navigate: vi.fn().mockName('Router.navigate'),
          },
        },
        {
          provide: FeedEntryService,
          useValue: {
            query: vi.fn().mockName('FeedEntryService.query'),
            readSome: vi.fn().mockName('FeedEntryService.readSome'),
            unreadSome: vi.fn().mockName('FeedEntryService.unreadSome'),
          },
        },
        {
          provide: ClassifierLabelService,
          useValue: {
            getAll: vi.fn().mockName('ClassifierLabelService.getAll'),
          },
        },
        {
          provide: ReadCounterService,
          useValue: {
            readAll: vi.fn().mockName('ReadCounterService.readAll'),
          },
        },
        {
          provide: FeedEntryVoteService,
          useValue: {
            shouldForceLabelVote: vi
              .fn()
              .mockName('FeedEntryVoteService.shouldForceLabelVote'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(FeedEntryViewComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
