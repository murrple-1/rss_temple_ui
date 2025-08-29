import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { RegistrationService } from '@app/services/data';

import { VerifyComponent } from './verify.component';

describe('VerifyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [VerifyComponent],
      providers: [
        {
          provide: RegistrationService,
          useValue: jasmine.createSpyObj<RegistrationService>(
            'RegistrationService',
            ['verifyEmail'],
          ),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(VerifyComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
