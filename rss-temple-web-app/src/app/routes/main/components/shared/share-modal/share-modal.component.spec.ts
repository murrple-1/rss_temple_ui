import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';

import { LemmyShareModalComponent } from '@app/routes/main/components/shared/share-modal/lemmy-share-modal/lemmy-share-modal.component';
import { MastodonShareModalComponent } from '@app/routes/main/components/shared/share-modal/mastodon-share-modal/mastodon-share-modal.component';
import { ConfigService } from '@app/services';
import { MockConfigService } from '@app/test/config.service.mock';

import { ShareModalComponent } from './share-modal.component';

async function setup() {
  const mockConfigService = new MockConfigService({});

  await TestBed.configureTestingModule({
    imports: [
      BrowserAnimationsModule,
      FormsModule,
      ClarityModule,
      ShareButtonDirective,
    ],
    declarations: [
      LemmyShareModalComponent,
      MastodonShareModalComponent,
      ShareModalComponent,
    ],
    providers: [{ provide: ConfigService, useValue: mockConfigService }],
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
