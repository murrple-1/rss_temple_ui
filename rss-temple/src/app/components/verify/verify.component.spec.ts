import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SnackbarModule } from 'ngx-snackbar';

import { UserService } from '@app/services/data';

import { VerifyComponent } from './verify.component';

async function setup() {
  const mockUserService = jasmine.createSpyObj<UserService>('UserService', [
    'verify',
  ]);

  await TestBed.configureTestingModule({
    imports: [SnackbarModule.forRoot(), RouterTestingModule.withRoutes([])],
    declarations: [VerifyComponent],
    providers: [
      {
        provide: UserService,
        useValue: mockUserService,
      },
    ],
  }).compileComponents();

  return {
    mockUserService,
  };
}

describe('VerifyComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(VerifyComponent);
      const component = componentFixture.debugElement
        .componentInstance as VerifyComponent;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'can run ngOnInit',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(VerifyComponent);
      const component = componentFixture.debugElement
        .componentInstance as VerifyComponent;

      component.ngOnInit();
      await componentFixture.whenStable();
      expect().nothing();
    }),
  );

  // TODO more tests
});
