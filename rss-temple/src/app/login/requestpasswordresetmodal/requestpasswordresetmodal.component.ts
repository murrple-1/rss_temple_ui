import { Component, OnDestroy } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';

@Component({
  templateUrl: 'requestpasswordresetmodal.component.html',
  styleUrls: ['requestpasswordresetmodal.component.scss'],
})
export class RequestPasswordResetModalComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(private activeModal: NgbActiveModal) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismiss() {
    this.activeModal.dismiss();
  }
}
