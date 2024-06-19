import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';

import { ConfigService } from '@app/services';
import { MockConfigService } from '@app/test/config.service.mock';

import { LemmyShareModalComponent } from './lemmy-share-modal.component';

async function setup() {
  const mockConfigService = new MockConfigService({});

  await TestBed.configureTestingModule({
    imports: [
      BrowserAnimationsModule,
      FormsModule,
      ClarityModule,
      ShareButtonDirective,
    ],
    declarations: [LemmyShareModalComponent],
    providers: [{ provide: ConfigService, useValue: mockConfigService }],
  }).compileComponents();

  return {};
}

describe('LemmyShareModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(LemmyShareModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
