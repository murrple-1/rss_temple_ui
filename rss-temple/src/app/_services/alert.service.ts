import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { Observable, Subject } from 'rxjs';

export interface Message {
  type: 'success' | 'error';
  text: string;
}

@Injectable()
export class AlertService {
  private subject = new Subject<Message>();
  private keepAfterNavigationChange = false;

  constructor(private router: Router) {
    this.router.events.subscribe({
      next: event => {
        if (event instanceof NavigationStart) {
          if (this.keepAfterNavigationChange) {
            this.keepAfterNavigationChange = false;
          } else {
            this.subject.next();
          }
        }
      },
    });
  }

  success(text: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'success', text: text });
  }

  error(text: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', text: text });
  }

  getMessage(): Observable<Message> {
    return this.subject.asObservable();
  }
}
