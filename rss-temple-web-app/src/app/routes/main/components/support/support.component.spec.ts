import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { ConfigService } from '@app/services';
import { MockConfigService } from '@app/test/config.service.mock';

import { SupportComponent } from './support.component';

async function setup() {
  const mockConfigService = new MockConfigService({
    apiHost: '',
    issueTrackerUrl: '',
    clientRepoUrl: '',
    serverRepoUrl: '',
  });

  await TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, ClarityModule],
    declarations: [SupportComponent],
    providers: [
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
    ],
  }).compileComponents();

  return {
    mockConfigService,
  };
}

describe('SupportComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(SupportComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
