import { NgClass } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClrAlertModule, ClrIconModule } from '@clr/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HttpErrorService } from '@app/services';
import { RegistrationService } from '@app/services/data';

enum State {
  NotStarted,
  Sending,
  Success,
  Error,
  NoToken,
}

@Component({
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  imports: [NgClass, ClrIconModule, ClrAlertModule, RouterLink],
})
export class VerifyComponent implements OnInit, OnDestroy {
  private zone = inject(NgZone);
  private activatedRoute = inject(ActivatedRoute);
  private registrationService = inject(RegistrationService);
  private httpErrorService = inject(HttpErrorService);

  readonly State = State;
  state = State.NotStarted;

  get alertClass() {
    switch (this.state) {
      case State.NotStarted: {
        return 'alert-warning';
      }
      case State.Error:
      case State.NoToken: {
        return 'alert-danger';
      }
      case State.Success: {
        return 'alert-success';
      }
      case State.Sending:
      default: {
        return 'alert-info';
      }
    }
  }

  get iconShape() {
    switch (this.state) {
      case State.NotStarted: {
        return 'exclamation-triangle';
      }
      case State.Error:
      case State.NoToken: {
        return 'exclamation-circle';
      }
      case State.Success: {
        return 'check-circle';
      }
      case State.Sending:
      default: {
        return 'info-circle';
      }
    }
  }

  get isLoginPageAnchorVisible() {
    switch (this.state) {
      case State.NotStarted:
      case State.Sending: {
        return false;
      }
      default: {
        return true;
      }
    }
  }

  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit() {
    const token = this.activatedRoute.snapshot.queryParamMap.get('token');

    if (token === null) {
      this.state = State.NoToken;
    } else {
      this.state = State.Sending;

      this.registrationService
        .verifyEmail(token)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.zone.run(() => {
              this.state = State.Success;
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);

            this.zone.run(() => {
              this.state = State.Error;
            });
          },
        });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
