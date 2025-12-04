import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
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
