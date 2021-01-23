import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { of, Observable } from 'rxjs';

import { PasswordResetTokenService } from '@app/services/data';

import {
  RequestPasswordResetModalComponent,
  State,
} from './request-password-reset-modal.component';

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
    declarations: [RequestPasswordResetModalComponent],
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
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;

      component.open = true;
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const debugElement = componentFixture.debugElement;

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
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance;

      const debugElement = componentFixture.debugElement;

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
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance as RequestPasswordResetModalComponent;

      const debugElement = componentFixture.debugElement;

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

      expect(component.state).not.toBe(State.Error);
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
        new Observable<void>(subscriber => {
          subscriber.error(
            new HttpErrorResponse({
              status: 0,
            }),
          );
        }),
      );
      spyOn(console, 'error');

      const componentFixture = TestBed.createComponent(
        RequestPasswordResetModalComponent,
      );
      componentFixture.detectChanges();
      await componentFixture.whenStable();

      const component = componentFixture.componentInstance as RequestPasswordResetModalComponent;

      const debugElement = componentFixture.debugElement;

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

      expect(component.state).toBe(State.Error);
      expect(mockPasswordResetTokenService.request).toHaveBeenCalledWith(
        'test@test.com',
      );
    }),
  );
});
