import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { SupportComponent } from './support.component';

describe('SupportComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        SupportComponent,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {
            apiHost: '',
            issueTrackerUrl: '',
            clientRepoUrl: '',
            serverRepoUrl: '',
          },
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(SupportComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
