import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportService } from '@app/services/data';

import { ReportFeedEntryModalComponent } from './report-feed-entry-modal.component';

describe('ReportFeedEntryModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserModule,
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
