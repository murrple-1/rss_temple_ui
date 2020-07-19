import { TestBed, async } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { SnackbarModule } from 'ngx-snackbar';

import { LoginService } from '@app/services';

import { RegisterComponent } from './register.component';

async function setup() {
  const mockLoginService = jasmine.createSpyObj<LoginService>('LoginService', [
    'createMyLogin',
    'createGoogleLogin',
    'createFacebookLogin',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,

      SnackbarModule.forRoot(),

      RouterTestingModule.withRoutes([]),
    ],
    declarations: [RegisterComponent],
    providers: [
      {
        provide: LoginService,
        useValue: mockLoginService,
      },
    ],
  }).compileComponents();

  return {
    mockLoginService,
  };
}

describe('RegisterComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(RegisterComponent);
    const component = componentFixture.debugElement
      .componentInstance as RegisterComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
