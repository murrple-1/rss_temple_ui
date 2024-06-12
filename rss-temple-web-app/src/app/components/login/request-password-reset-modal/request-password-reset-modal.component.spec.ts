import { HttpErrorResponse } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule, ClrLoadingState } from '@clr/angular';
import { of, throwError } from 'rxjs';

import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { AuthService } from '@app/services/data';

import { RequestPasswordResetModalComponent } from './request-password-reset-modal.component';

async function setup() {
  const mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
    'requestPasswordReset',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterModule.forRoot([]),
    ],
    declarations: [RequestPasswordResetModalComponent, EmailValidatorDirective],
    providers: [
      {
        provide: AuthService,
        useValue: mockAuthService,
      },
    ],
  }).compileComponents();

  return {
    mockAuthService,
  };
}

describe('RequestPasswordResetModalComponent', () => {
  it('should create the component', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  it('should handle missing email', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;

    component.open = true;
    componentFixture.detectChanges();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = '';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const requestButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    requestButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(
      component._passwordResetRequestForm?.controls['email']?.errors ?? {},
    ).toEqual(
      jasmine.objectContaining({
        required: jasmine.anything(),
      }),
    );
  }));

  it('should handle malformed email', waitForAsync(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;

    component.open = true;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'bademail';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const requestButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    requestButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(
      component._passwordResetRequestForm?.controls['email']?.errors ?? {},
    ).toEqual(
      jasmine.objectContaining({
        invalidemail: jasmine.anything(),
      }),
    );
  }));

  it('should request a password reset', waitForAsync(async () => {
    const { mockAuthService } = await setup();
    mockAuthService.requestPasswordReset.and.returnValue(of(undefined));

    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;

    component.open = true;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const requestButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    requestButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component.requestButtonState).not.toBe(ClrLoadingState.DEFAULT);
    expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
      'test@test.com',
    );
  }));

  it('should handle failed requests', waitForAsync(async () => {
    const { mockAuthService } = await setup();
    mockAuthService.requestPasswordReset.and.returnValue(
      throwError(
        new HttpErrorResponse({
          status: 0,
        }),
      ),
    );
    spyOn(console, 'error');

    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.componentInstance;
    const debugElement = componentFixture.debugElement;

    component.open = true;
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const emailInput = debugElement.query(By.css('input[type="email"]'))
      .nativeElement as HTMLInputElement;
    emailInput.value = 'test@test.com';
    emailInput.dispatchEvent(new Event('input'));
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    const requestButton = debugElement.query(By.css('button[type="submit"]'))
      .nativeElement as HTMLButtonElement;
    requestButton.click();
    componentFixture.detectChanges();
    await componentFixture.whenStable();

    expect(component.requestButtonState).toBe(ClrLoadingState.DEFAULT);
    expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
      'test@test.com',
    );
  }));
});
