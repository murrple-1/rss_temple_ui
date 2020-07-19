import { TestBed, async } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SnackbarModule } from 'ngx-snackbar';

import { PasswordResetTokenService } from '@app/services/data';

import { RequestPasswordResetModalComponent } from './requestpasswordresetmodal.component';

async function setup() {
  const mockActiveModal = jasmine.createSpyObj<NgbActiveModal>(
    'NgbActiveModal',
    ['dismiss', 'close'],
  );

  const mockPasswordResetToken = jasmine.createSpyObj<
    PasswordResetTokenService
  >('PasswordResetTokenService', ['request']);

  await TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,

      SnackbarModule.forRoot(),

      RouterTestingModule.withRoutes([]),
    ],
    declarations: [RequestPasswordResetModalComponent],
    providers: [
      {
        provide: NgbActiveModal,
        useValue: mockActiveModal,
      },
      {
        provide: PasswordResetTokenService,
        useValue: mockPasswordResetToken,
      },
    ],
  }).compileComponents();

  return {
    mockActiveModal,

    mockPasswordResetToken,
  };
}

describe('RequestPasswordResetModalComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.debugElement
      .componentInstance as RequestPasswordResetModalComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
