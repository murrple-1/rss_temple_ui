import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { first } from 'rxjs/operators';

import { AlertService } from '../_services/alert.service';
import { LoginService } from '../_services/login.service';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['register.component.scss'],
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;

    private fb_id: string;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private loginService: LoginService,
        private alertService: AlertService,
    ) { }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.fb_id = this.route.snapshot.paramMap.get('fb_id');
    }

    onSubmit() {
        this.submitted = true;
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;

        // TODO cleanup
        if (this.fb_id !== null) {
            this.loginService.createFacebookLogin(this.registerForm.controls.email.value, this.registerForm.controls.password.value, this.fb_id).pipe(
                first()
            ).subscribe(
                _ => {
                    this.router.navigate(['/login']);
                },
                error => {
                    let errorMessage = 'Unknown Error';
                    if ('status' in error) {
                        switch (error.status) {
                            case 0:
                                errorMessage = 'Unable to connect to server';
                                break;
                            case 409:
                                errorMessage = 'Email already in use';
                                break;
                        }
                    }
                    this.alertService.error(errorMessage);

                    this.loading = false;
                }
            );
        } else {
            this.loginService.createMyLogin(this.registerForm.controls.email.value, this.registerForm.controls.password.value).pipe(
                first()
            ).subscribe(
                _ => {
                    this.router.navigate(['/login']);
                },
                error => {
                    let errorMessage = 'Unknown Error';
                    if ('status' in error) {
                        switch (error.status) {
                            case 0:
                                errorMessage = 'Unable to connect to server';
                                break;
                            case 409:
                                errorMessage = 'Email already in use';
                                break;
                        }
                    }
                    this.alertService.error(errorMessage);

                    this.loading = false;
                }
            );
        }
    }
}
