import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

enum State {
  NotStarted,
  Sending,
  Success,
  Error,
  NoToken,
}

@Component({
  templateUrl: 'verify.component.html',
  styleUrls: ['verify.component.scss'],
})
export class VerifyComponent implements OnInit, OnDestroy {
  readonly State = State;
  state = State.NotStarted;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnInit() {
    const token = this.activatedRoute.snapshot.queryParamMap.get('token');

    if (token === null) {
      this.state = State.NoToken;
    } else {
      this.state = State.Sending;

      this.userService
        .verify(token)
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
