import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordsMatchValidatorDirective } from '@app/directives/passwords-match-validator.directive';
import { AuthService } from '@app/services/data';

import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserModule,
        ClarityModule,
        RouterModule.forRoot([]),
        ResetPasswordComponent,
        PasswordsMatchValidatorDirective,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            resetPassword: vi.fn().mockName('AuthService.resetPassword'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(ResetPasswordComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
