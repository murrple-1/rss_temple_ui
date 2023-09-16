import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareModule } from 'ngx-sharebuttons';

import { MockConfigService } from '@app/test/config.service.mock';

import { ShareModalComponent } from './share-modal.component';

async function setup() {
  const mockConfigService = new MockConfigService({
    apiHost: '',
    onboardingYoutubeEmbededUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, ClarityModule, ShareModule],
    declarations: [ShareModalComponent],
  }).compileComponents();

  return {
    mockConfigService,
  };
}

describe('ShareModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(ShareModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
