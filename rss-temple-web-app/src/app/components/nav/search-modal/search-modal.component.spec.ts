import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { SearchModalComponent } from './search-modal.component';

describe('SearchModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        FormsModule,
        ClarityModule,
        SearchModalComponent,
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(SearchModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });
});
