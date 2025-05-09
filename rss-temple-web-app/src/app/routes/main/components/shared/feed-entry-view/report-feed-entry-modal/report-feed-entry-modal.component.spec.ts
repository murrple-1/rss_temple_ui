import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { ReportService } from '@app/services/data';
import { MockConfigService } from '@app/test/config.service.mock';

import { ReportFeedEntryModalComponent } from './report-feed-entry-modal.component';

async function setup() {
  const mockReportService = jasmine.createSpyObj<ReportService>(
    'ReportService',
    ['reportFeedEntry'],
  );

  const mockConfigService = new MockConfigService({
    apiHost: '',
    onboardingYoutubeEmbededUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [FormsModule, BrowserAnimationsModule, ClarityModule],
    declarations: [ReportFeedEntryModalComponent],
    providers: [
      {
        provide: ReportService,
        useValue: mockReportService,
      },
    ],
  }).compileComponents();

  return {
    mockConfigService,
  };
}

describe('ReportFeedEntryModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      ReportFeedEntryModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
