import { TestBed, waitForAsync } from '@angular/core/testing';

import { FeedsFooterComponent } from './feeds-footer.component';

async function setup() {
  await TestBed.configureTestingModule({
    declarations: [FeedsFooterComponent],
  }).compileComponents();

  return {};
}

describe('FeedsFooterComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(FeedsFooterComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
