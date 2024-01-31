import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule } from '@clr/angular';

import { OPMLService, ProgressService } from '@app/services/data';

import { OPMLModalComponent } from './opml-modal.component';

async function setup() {
  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'upload',
  ]);
  const mockProgressService = jasmine.createSpyObj<ProgressService>(
    'ProgressService',
    ['checkProgress'],
  );

  await TestBed.configureTestingModule({
    imports: [
      ClarityModule,
      BrowserAnimationsModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [OPMLModalComponent],
    providers: [
      {
        provide: OPMLService,
        useValue: mockOPMLService,
      },
      {
        provide: ProgressService,
        useValue: mockProgressService,
      },
    ],
  }).compileComponents();

  return {
    mockOPMLService,
    mockProgressService,
  };
}

describe('OPMLModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(OPMLModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
