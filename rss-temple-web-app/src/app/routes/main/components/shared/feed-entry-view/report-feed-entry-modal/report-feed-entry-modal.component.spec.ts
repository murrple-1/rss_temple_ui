import { provideHttpClient } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { ReportService } from '@app/services/data';

import { ReportFeedEntryModalComponent } from './report-feed-entry-modal.component';

describe('ReportFeedEntryModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, BrowserAnimationsModule, ClarityModule],
      declarations: [ReportFeedEntryModalComponent],
      providers: [
        provideHttpClient(),
        {
          provide: ReportService,
          useValue: jasmine.createSpyObj<ReportService>('ReportService', [
            'reportFeedEntry',
          ]),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(
      ReportFeedEntryModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
