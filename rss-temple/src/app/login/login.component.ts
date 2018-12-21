import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertService } from '@app/_services/alert.service';
import { LoginService } from '@app/_services/login.service';
import { GAuthService } from '@app/_services/gauth.service';
import { FBAuthService } from '@app/_services/fbauth.service';
import { setSessionToken } from '@app/_modules/session.module';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    submitted = false;
    returnUrl: string;

    isLoggingIn = false;

    gLoaded = false;
    fbLoaded = false;

    private unsubscribe$ = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loginService: LoginService,
        private alertService: AlertService,
        private gAuthService: GAuthService,
        private fbAuthService: FBAuthService,
        private zone: NgZone,
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/main';

        this.gAuthService.isLoaded$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(isLoaded => {
            if (isLoaded !== this.gLoaded) {
                this.zone.run(() => {
                    this.gLoaded = isLoaded;
                });
            }

            if (!isLoaded) {
                this.gAuthService.load();
            }
        });

        this.gAuthService.user$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(user => {
            this.zone.run(() => {
                this.isLoggingIn = false;
            });

            if (user) {
                this.handleGoogleUser(user);
            }
        });

        this.fbAuthService.isLoaded$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(isLoaded => {
            if (isLoaded !== this.fbLoaded) {
                this.zone.run(() => {
                    this.fbLoaded = isLoaded;
                });
            }

            if (!isLoaded) {
                this.fbAuthService.load();
            }
        });

        this.fbAuthService.user$.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(user => {
            this.zone.run(() => {
                this.isLoggingIn = false;
            });

            if (user) {
                this.handleFacebookUser(user);
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        this.isLoggingIn = true;
        this.loginService.getMyLoginSession(this.loginForm.controls.email.value, this.loginForm.controls.password.value).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(
            this.handleLoginSuccess.bind(this),
            error => {
                let errorMessage = 'Unknown Error';
                switch (error.status) {
                    case 0:
                        errorMessage = 'Unable to connect to server';
                        break;
                    case 403:
                        errorMessage = 'Email or password wrong';
                        break;
                }
                this.alertService.error(errorMessage);

                this.isLoggingIn = false;
            }
        );
    }

    private handleLoginSuccess(data: string | Object) {
        if (typeof data === 'string') {
            this.zone.run(() => {
                setSessionToken(data);

                this.router.navigate([this.returnUrl]);
            });
        } else {
            throw new Error('data is not a string');
        }
    }

    onGoogleLogin() {
        this.isLoggingIn = true;
        this.gAuthService.signIn();
    }

    private handleGoogleUser(user: gapi.auth2.GoogleUser) {
        this.loginService.getGoogleLoginSession(user).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(
            this.handleLoginSuccess.bind(this),
            error => {
                if (error.status === 422) {
                    this.zone.run(() => {
                        this.router.navigate(['/register', { g_token: error.error.token, email: error.error.email }]);
                    });
                } else {
                    let errorMessage = 'Unknown Error';
                    switch (error.status) {
                        case 0:
                            errorMessage = 'Unable to connect to server';
                            break;
                    }

                    this.zone.run(() => {
                        this.alertService.error(errorMessage);

                        this.isLoggingIn = false;
                    });
                }
            }
        );
    }

    onFacebookLogin() {
        this.isLoggingIn = true;
        this.fbAuthService.signIn();
    }

    private handleFacebookUser(user: fb.AuthResponse) {
        this.loginService.getFacebookLoginSession(user).pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(
            this.handleLoginSuccess.bind(this),
            error => {
                if (error.status === 422) {
                    this.zone.run(() => {
                        this.router.navigate(['/register', { fb_token: error.error.token, email: error.error.email }]);
                    });
                } else {
                    let errorMessage = 'Unknown Error';
                    switch (error.status) {
                        case 0:
                            errorMessage = 'Unable to connect to server';
                            break;
                    }

                    this.zone.run(() => {
                        this.alertService.error(errorMessage);

                        this.isLoggingIn = false;
                    });
                }
            }
        );
    }
}
