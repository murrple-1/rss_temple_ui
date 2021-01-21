import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppAlertsService, LoginService } from '@app/services';

export enum State {
  Ready,
  IsRegistering,
  RegisterFailed,
}

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  state = State.Ready;
  readonly State = State;

  email = '';
  password = '';
  passwordCheck = '';

  private googleToken: string | null = null;
  private facebookToken: string | null = null;

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
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onRegister() {
    // TODO check error state

    this.state = State.IsRegistering;

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
      this.state = State.RegisterFailed;
    });
  }
}
