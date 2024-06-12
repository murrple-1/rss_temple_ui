import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';

import { ClassifierLabelService } from '@app/services/data';
import { MockConfigService } from '@app/test/config.service.mock';

import { LabelVoteModalComponent } from './label-vote-modal.component';

async function setup() {
  const mockFeedService = jasmine.createSpyObj<ClassifierLabelService>(
    'FeedService',
    ['getAll'],
  );

  const mockConfigService = new MockConfigService({
    apiHost: '',
    onboardingYoutubeEmbededUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, ClarityModule, ShareButtonDirective],
    declarations: [LabelVoteModalComponent],
    providers: [
      {
        provide: ClassifierLabelService,
        useValue: mockFeedService,
      },
    ],
  }).compileComponents();

  return {
    mockConfigService,
  };
}

describe('LabelVoteModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LabelVoteModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
