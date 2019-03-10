import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';

@Component({
  templateUrl: 'verify.component.html',
  styleUrls: ['verify.component.scss'],
})
export class VerifyComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
