import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';

import { PasswordResetTokenService } from '@app/_services/data';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorService } from '@app/_services';

@Component({
  templateUrl: 'requestpasswordresetmodal.component.html',
  styleUrls: ['requestpasswordresetmodal.component.scss'],
})
export class RequestPasswordResetModalComponent implements OnDestroy {
  forgottenPasswordForm: FormGroup;

  submitted = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
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
    this.submitted = true;

    if (this.forgottenPasswordForm.controls.email.errors) {
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
        },
      });
  }
}
