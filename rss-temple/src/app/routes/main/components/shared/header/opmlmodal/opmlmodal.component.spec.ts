import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { OPMLModalComponent } from './opmlmodal.component';
import { OPMLService, ProgressService } from '@app/services/data';

async function setup() {
  const mockActiveModal = jasmine.createSpyObj<NgbActiveModal>(
    'NgbActiveModal',
    ['dismiss', 'close'],
  );

  const mockOPMLService = jasmine.createSpyObj<OPMLService>('OPMLService', [
    'upload',
  ]);
  const mockProgressService = jasmine.createSpyObj<ProgressService>(
    'ProgressService',
    ['checkProgress'],
  );

  await TestBed.configureTestingModule({
    imports: [SnackbarModule.forRoot(), RouterTestingModule.withRoutes([])],
    declarations: [OPMLModalComponent],
    providers: [
      {
        provide: NgbActiveModal,
        useValue: mockActiveModal,
      },

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
    mockActiveModal,

    mockOPMLService,
    mockProgressService,
  };
}

describe('OPMLModalComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(OPMLModalComponent);
    const component = componentFixture.debugElement
      .componentInstance as OPMLModalComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
