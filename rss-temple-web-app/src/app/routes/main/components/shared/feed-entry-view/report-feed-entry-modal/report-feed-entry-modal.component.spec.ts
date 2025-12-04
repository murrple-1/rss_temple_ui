import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportService } from '@app/services/data';

import { ReportFeedEntryModalComponent } from './report-feed-entry-modal.component';

describe('ReportFeedEntryModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        ReportFeedEntryModalComponent,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: ReportService,
          useValue: {
            reportFeedEntry: vi.fn().mockName('ReportService.reportFeedEntry'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(
      ReportFeedEntryModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });
});
