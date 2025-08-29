import { TestBed, waitForAsync } from '@angular/core/testing';

import { FeedsFooterComponent } from './feeds-footer.component';

describe('FeedsFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedsFooterComponent],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(FeedsFooterComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
