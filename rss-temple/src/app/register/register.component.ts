import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertService, LoginService } from '@app/_services';
import { isValidPassword } from '@app/_modules/password.module';
import { FormGroupErrors } from '@app/_modules/formgrouperrors.module';

enum State {
  Ready,
  IsRegistering,
  RegisterFailed,
}

@Component({
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  state = State.Ready;
  readonly State = State;

  registerForm: FormGroup;

  registerFormErrors = new FormGroupErrors();

  private g_token: string | null = null;
  private fb_token: string | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private loginService: LoginService,
    private alertService: AlertService,
  ) {
    this.registerForm = this.formBuilder.group({
      email: [
        this.route.snapshot.paramMap.get('email') || '',
        [Validators.required, Validators.email],
      ],
      password: ['', [Validators.required, isValidPassword()]],
    });

    this.registerFormErrors.initializeControls(this.registerForm);
  }

  ngOnInit() {
    this.g_token = this.route.snapshot.paramMap.get('g_token');
    this.fb_token = this.route.snapshot.paramMap.get('fb_token');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.state = State.RegisterFailed;
      return;
    }

    this.state = State.IsRegistering;

    if (this.g_token !== null) {
      this.loginService
        .createGoogleLogin(
          this.registerForm.controls.email.value as string,
          this.registerForm.controls.password.value as string,
          this.g_token,
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else if (this.fb_token !== null) {
      this.loginService
        .createFacebookLogin(
          this.registerForm.controls.email.value as string,
          this.registerForm.controls.password.value as string,
          this.fb_token,
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: this.handleRegisterSuccess.bind(this),
          error: this.handleRegisterError.bind(this),
        });
    } else {
      this.loginService
        .createMyLogin(
          this.registerForm.controls.email.value as string,
          this.registerForm.controls.password.value as string,
        )
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

    this.zone.run(() => {
      this.alertService.error(errorMessage, 5000);

      this.state = State.RegisterFailed;
    });
  }
}
