import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { ReportService } from '@app/services/data';
import { MockConfigService } from '@app/test/config.service.mock';

import { ReportFeedModalComponent } from './report-feed-modal.component';

async function setup() {
  const mockReportService = jasmine.createSpyObj<ReportService>(
    'ReportService',
    ['reportFeed'],
  );

  const mockConfigService = new MockConfigService({
    apiHost: '',
    onboardingYoutubeEmbededUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [FormsModule, BrowserAnimationsModule, ClarityModule],
    declarations: [ReportFeedModalComponent],
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

describe('ReportFeedModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(ReportFeedModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
