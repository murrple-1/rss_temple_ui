import { TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayObservableService } from '@app/routes/main/services';

import { DisplayOptionsViewComponent } from './display-options.component';

async function setup() {
  await TestBed.configureTestingModule({
    declarations: [DisplayOptionsViewComponent],
    providers: [DisplayObservableService],
  }).compileComponents();

  return {};
}

describe('DisplayOptionsViewComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(
        DisplayOptionsViewComponent,
      );
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
