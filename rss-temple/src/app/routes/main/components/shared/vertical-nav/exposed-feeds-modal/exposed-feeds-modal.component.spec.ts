import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';

import { ExposedFeedsModalComponent } from './exposed-feeds-modal.component';

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      ClarityModule,
      BrowserAnimationsModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [ExposedFeedsModalComponent],
  }).compileComponents();

  return {};
}

describe('ExposedFeedsModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      ExposedFeedsModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
