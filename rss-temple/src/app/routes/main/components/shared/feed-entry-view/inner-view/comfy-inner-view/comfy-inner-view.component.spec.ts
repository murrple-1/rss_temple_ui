import { TestBed, waitForAsync } from '@angular/core/testing';

import { ComfyInnerViewComponent } from './comfy-inner-view.component';

async function setup() {
  await TestBed.configureTestingModule({
    declarations: [ComfyInnerViewComponent],
  }).compileComponents();

  return {};
}

describe('ComfyInnerViewComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(ComfyInnerViewComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
