import { Component, OnInit, OnDestroy } from '@angular/core';

import { AlertService } from '../_services/alert.service';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user';
import { Subscription } from '../../../node_modules/rxjs';

@Component({
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
    private subscription: Subscription;

    private user: User;

    constructor(
        private userService: UserService,
        private alertService: AlertService) {}

    ngOnInit() {
        this.subscription = this.userService.get().subscribe(value => {
            this.user = value;
        }, error => {
            let errorMessage = 'Unknown Error';
                if ('status' in error) {
                    switch (error.status) {
                        case 0:
                            errorMessage = 'Unable to connect to server';
                            break;
                    }
                }
                this.alertService.error(errorMessage);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
