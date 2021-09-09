import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UserService } from '@app/services/data';

import { VerifyComponent } from './verify.component';

async function setup() {
  const mockUserService = jasmine.createSpyObj<UserService>('UserService', [
    'verify',
  ]);

  await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes([])],
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
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
      componentFixture.detectChanges();
      await componentFixture.whenStable();
    }),
  );

  // TODO more tests
});
