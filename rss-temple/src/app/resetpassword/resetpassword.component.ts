import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

@Component({
  templateUrl: 'resetpassword.component.html',
  styleUrls: ['resetpassword.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
