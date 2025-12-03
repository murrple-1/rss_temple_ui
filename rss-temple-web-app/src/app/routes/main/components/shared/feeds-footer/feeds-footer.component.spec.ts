import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FeedsFooterComponent } from './feeds-footer.component';

describe('FeedsFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedsFooterComponent],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(FeedsFooterComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
