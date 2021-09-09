import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { SubscribeModalComponent } from './subscribe-modal.component';

async function setup() {
  await TestBed.configureTestingModule({
    imports: [FormsModule, BrowserAnimationsModule, ClarityModule],
    declarations: [SubscribeModalComponent],
  }).compileComponents();

  return {};
}

describe('SubscribeModalComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(SubscribeModalComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
