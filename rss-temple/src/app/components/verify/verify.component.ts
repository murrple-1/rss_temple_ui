import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RegistrationService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

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
})
export class VerifyComponent implements OnInit, OnDestroy {
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

  constructor(
    private zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private registrationService: RegistrationService,
    private httpErrorService: HttpErrorService,
  ) {}

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
