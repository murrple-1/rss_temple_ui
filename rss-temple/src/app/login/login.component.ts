import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { first } from 'rxjs/operators';

import { AlertService } from '../_services/alert.service';
import { LoginService } from '../_services/login.service';
import { GAuthService } from '../_services/gauth.service';
import { FBAuthService } from '../_services/fbauth.service';

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private loginService: LoginService,
        private alertService: AlertService,
        private gAuthService: GAuthService,
        private fbAuthService: FBAuthService,
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        localStorage.removeItem('sessionToken');

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        if (!this.gAuthService.isLoaded$.getValue()) {
            this.gAuthService.load();
        }

        if (!this.fbAuthService.isLoaded$.getValue()) {
            this.fbAuthService.load();
        }
    }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.loginService.getMyLoginSession(this.loginForm.controls.email.value, this.loginForm.controls.password.value).pipe(
            first()
        ).subscribe(
            data => {
                localStorage.setItem('sessionToken', data);

                this.router.navigate([this.returnUrl]);
            },
            error => {
                let errorMessage = 'Unknown Error';
                if ('status' in error) {
                    switch (error.status) {
                        case 0:
                            errorMessage = 'Unable to connect to server';
                            break;
                        case 403:
                            errorMessage = 'Email or password wrong';
                            break;
                    }
                }
                this.alertService.error(errorMessage);

                this.loading = false;
            }
        );
    }

    onGoogleLogin() {
        console.log('Google');
    }

    onFacebookLogin() {
        console.log('Facebook');
    }
}
