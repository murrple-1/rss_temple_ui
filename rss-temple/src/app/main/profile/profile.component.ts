import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

import { Subject } from 'rxjs';

@Component({
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  save() {
    console.log('saved!');
  }
}
