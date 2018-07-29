import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '../_services/alert.service';
import { LoginService } from '../_services/login.service';

@Component({
    templateUrl: 'login.component.html'
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
        private alertService: AlertService) {}

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        localStorage.removeItem('sessionToken');

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.loginService.getMyLoginSession(this.loginForm.controls.email.value, this.loginForm.controls.password.value).subscribe(
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
}
