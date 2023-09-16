import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { SearchModalComponent } from './search-modal.component';

async function setup() {
  await TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule, FormsModule, ClarityModule],
    declarations: [SearchModalComponent],
  }).compileComponents();

  return {};
}

describe('SearchModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(SearchModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
