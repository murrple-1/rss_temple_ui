import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SubscribeModalComponent } from './subscribe-modal.component';

async function setup() {
  await TestBed.configureTestingModule({
    imports: [FormsModule],
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
      const component = componentFixture.debugElement
        .componentInstance as SubscribeModalComponent;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
