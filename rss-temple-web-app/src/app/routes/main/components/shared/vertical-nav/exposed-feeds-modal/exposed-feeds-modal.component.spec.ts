import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { ExposedFeedsModalComponent } from './exposed-feeds-modal.component';

describe('ExposedFeedsModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        ExposedFeedsModalComponent,
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(
      ExposedFeedsModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
