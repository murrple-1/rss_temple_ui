import { Component, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';

import { PasswordResetTokenService } from '@app/_services/data';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorService } from '@app/_services';

enum State {
  NotStarted,
  Sending,
  Error,
}

@Component({
  templateUrl: 'requestpasswordresetmodal.component.html',
  styleUrls: ['requestpasswordresetmodal.component.scss'],
})
export class RequestPasswordResetModalComponent implements OnDestroy {
  state = State.NotStarted;
  readonly State = State;

  forgottenPasswordForm: FormGroup;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private zone: NgZone,
    private passwordResetTokenService: PasswordResetTokenService,
    private httpErrorService: HttpErrorService,
  ) {
    this.forgottenPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  request() {
    this.state = State.Sending;

    if (this.forgottenPasswordForm.controls.email.errors) {
      this.state = State.Error;
      return;
    }

    this.passwordResetTokenService
      .request(this.forgottenPasswordForm.controls.email.value as string)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.activeModal.close();
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
