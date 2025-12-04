import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule, ClrLoadingState } from '@clr/angular';
import { of, throwError } from 'rxjs';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { EmailValidatorDirective } from '@app/directives/email-validator.directive';
import { AuthService } from '@app/services/data';

import { RequestPasswordResetModalComponent } from './request-password-reset-modal.component';

describe('RequestPasswordResetModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        RouterModule.forRoot([]),
        RequestPasswordResetModalComponent,
        EmailValidatorDirective,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            requestPasswordReset: vi
              .fn()
              .mockName('AuthService.requestPasswordReset'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(
      RequestPasswordResetModalComponent,
    );
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  it('should handle missing email', async () => {
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
      expect.objectContaining({
        required: expect.anything(),
      }),
    );
  });

  it('should handle malformed email', async () => {
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
      expect.objectContaining({
        invalidemail: expect.anything(),
      }),
    );
  });

  it('should request a password reset', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.requestPasswordReset.mockReturnValue(of(undefined));

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
  });

  it('should handle failed requests', async () => {
    const mockAuthService = TestBed.inject(
      AuthService,
    ) as MockedObject<AuthService>;
    mockAuthService.requestPasswordReset.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
          }),
      ),
    );
    vi.spyOn(console, 'error');

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
  });
});
