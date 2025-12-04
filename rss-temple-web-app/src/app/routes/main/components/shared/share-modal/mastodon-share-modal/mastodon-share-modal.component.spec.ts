import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConfigService } from '@app/services';
import {
  MOCK_CONFIG_SERVICE_CONFIG,
  MockConfigService,
} from '@app/test/config.service.mock';

import { MastodonShareModalComponent } from './mastodon-share-modal.component';

describe('MastodonShareModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        FormsModule,
        ClarityModule,
        ShareButtonDirective,
        MastodonShareModalComponent,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
        {
          provide: MOCK_CONFIG_SERVICE_CONFIG,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(
      MastodonShareModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });
});
