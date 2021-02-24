import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ClrLoadingState } from '@clr/angular';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppAlertsService } from '@app/services';
import {
  MinLength as PasswordMinLength,
  passwordRequirementsTextHtml,
  SpecialCharacters as PasswordSpecialCharacters,
} from '@app/libs/password.lib';
import { LoginService } from '@app/services/data';

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  host: {
    'class': 'content-container',
  },
})
export class RegisterComponent implements OnInit, OnDestroy {
  readonly passwordHelperTextHtml = passwordRequirementsTextHtml('en');
  readonly passwordMinLength = PasswordMinLength;
  readonly passwordSpecialCharacters = PasswordSpecialCharacters.join('');

  email = '';
  password = '';
  passwordCheck = '';

  private googleToken: string | null = null;
  private facebookToken: string | null = null;

  readonly ClrLoadingState = ClrLoadingState;
  registerButtonState = ClrLoadingState.DEFAULT;

  @ViewChild('registerForm', { static: true })
  registerForm?: NgForm;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private loginService: LoginService,
    private appAlertsService: AppAlertsService,
  ) {}

  ngOnInit() {
    this.googleToken = this.route.snapshot.paramMap.get('g_token');
    this.facebookToken = this.route.snapshot.paramMap.get('fb_token');
    this.email = this.route.snapshot.paramMap.get('email') ?? '';
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onRegister() {
    if (this.registerForm === undefined) {
      throw new Error('registerForm undefined');
    }

    if (this.registerForm.invalid) {
      return;
    }

    this.registerButtonState = ClrLoadingState.LOADING;

    if (this.googleToken !== null) {
      this.loginService
        .createGoogleLogin(this.email, this.password, this.googleToken)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else if (this.facebookToken !== null) {
      this.loginService
        .createFacebookLogin(this.email, this.password, this.facebookToken)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else {
      this.loginService
        .createMyLogin(this.email, this.password)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    }
  }

  private handleRegisterSuccess() {
    this.zone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  private handleRegisterError(error: any) {
    let errorMessage = 'Unknown Error';
    switch (error.status) {
      case 0:
        errorMessage = 'Unable to connect to server';
        break;
      case 409:
        errorMessage = 'Email already in use';
        break;
    }

    this.appAlertsService.appAlertDescriptor$.next({
      autoCloseInterval: 5000,
      canClose: true,
      text: errorMessage,
      type: 'danger',
    });

    this.zone.run(() => {
      this.registerButtonState = ClrLoadingState.DEFAULT;
    });
  }
}
