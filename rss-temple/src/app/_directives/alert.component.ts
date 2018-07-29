import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService, Message } from '../_services/alert.service';

@Component({
    selector: 'app-alert',
    templateUrl: 'alert.component.html'
})
export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: Message;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            this.message = message;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
