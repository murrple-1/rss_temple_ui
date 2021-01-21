import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OPMLModalComponent } from './opml-modal.component';
import { OPMLService, ProgressService } from '@app/services/data';

async function setup() {
  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'upload',
  ]);
  const mockProgressService = jasmine.createSpyObj<ProgressService>(
    'ProgressService',
    ['checkProgress'],
  );

  await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes([])],
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
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(OPMLModalComponent);
      const component = componentFixture.debugElement
        .componentInstance as OPMLModalComponent;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
