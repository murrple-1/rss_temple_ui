import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule, ClrLoadingState } from '@clr/angular';

import { of, throwError } from 'rxjs';

import { PasswordResetTokenService } from '@app/services/data';
import { EmailValidatorDirective } from '@app/directives/email-validator.directive';

import { RequestPasswordResetModalComponent } from './request-password-reset-modal.component';

async function setup() {
  const mockPasswordResetTokenService = jasmine.createSpyObj<PasswordResetTokenService>(
    'PasswordResetTokenService',
    ['request'],
  );

  await TestBed.configureTestingModule({
    imports: [
      FormsModule,
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [RequestPasswordResetModalComponent, EmailValidatorDirective],
    providers: [
      {
        provide: PasswordResetTokenService,
        useValue: mockPasswordResetTokenService,
      },
    ],
  }).compileComponents();

  return {
    mockPasswordResetTokenService,
  };
}

describe('RequestPasswordResetModalComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(
        RequestPasswordResetModalComponent,
      );
      const component = componentFixture.componentInstance;
      expect(component).toBeTruthy();
    }),
  );

  it(
    'should handle missing email',
    waitForAsync(async () => {
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
    }),
  );

  it(
    'should handle malformed email',
    waitForAsync(async () => {
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
    }),
  );

  it(
    'should request a password reset',
    waitForAsync(async () => {
      const { mockPasswordResetTokenService } = await setup();
      mockPasswordResetTokenService.request.and.returnValue(of(undefined));

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
      expect(mockPasswordResetTokenService.request).toHaveBeenCalledWith(
        'test@test.com',
      );
    }),
  );

  it(
    'should handle failed requests',
    waitForAsync(async () => {
      const { mockPasswordResetTokenService } = await setup();
      mockPasswordResetTokenService.request.and.returnValue(
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
      expect(mockPasswordResetTokenService.request).toHaveBeenCalledWith(
        'test@test.com',
      );
    }),
  );
});
