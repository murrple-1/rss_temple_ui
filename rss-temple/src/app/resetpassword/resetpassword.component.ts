import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PasswordResetTokenService } from '@app/_services/data';
import { HttpErrorService } from '@app/_services';

@Component({
  templateUrl: 'resetpassword.component.html',
  styleUrls: ['resetpassword.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private static readonly timeoutInterval = 2000;

  token: string | null = null;

  resetPasswordForm: FormGroup;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private passwordResetTokenService: PasswordResetTokenService,
    private httpErrorService: HttpErrorService,
  ) {
    this.resetPasswordForm = this.formBuilder.group(
      {
        newPassword: [''],
        newPasswordCheck: [''],
      },
      {
        validators: [],
      },
    );
  }

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSave() {
    if (this.token === null) {
      return;
    }

    this.passwordResetTokenService
      .reset({
        token: this.token,
        password: this.resetPasswordForm.controls.newPassword.value as string,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          window.setTimeout(() => {
            this.router.navigate(['/login']);
          }, ResetPasswordComponent.timeoutInterval);
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }
}
