import { TestBed, waitForAsync } from '@angular/core/testing';

import { ClarityModule } from '@clr/angular';

import { SupportComponent } from './support.component';

async function setup() {
  await TestBed.configureTestingModule({
    imports: [ClarityModule],
    declarations: [SupportComponent],
  }).compileComponents();

  return {};
}

describe('SupportComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(SupportComponent);
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
