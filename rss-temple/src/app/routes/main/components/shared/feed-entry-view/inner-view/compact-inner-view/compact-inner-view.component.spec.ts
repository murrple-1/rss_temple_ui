import { TestBed, waitForAsync } from '@angular/core/testing';

import { CompactInnerViewComponent } from './compact-inner-view.component';

async function setup() {
  await TestBed.configureTestingModule({
    declarations: [CompactInnerViewComponent],
  }).compileComponents();

  return {};
}

describe('CompactInnerViewComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(
        CompactInnerViewComponent,
      );
      const component = componentFixture.debugElement
        .componentInstance as CompactInnerViewComponent;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
