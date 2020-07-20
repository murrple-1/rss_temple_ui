import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { FBAuthService } from '@app/services/fbauth.service';

@Injectable()
export class MockFBAuthService extends FBAuthService {
  user$ = new BehaviorSubject<facebook.AuthResponse | null>(null);
  isLoaded$ = new BehaviorSubject<boolean>(false);

  get user() {
    return this.user$.getValue();
  }

  get isLoaded() {
    return this.isLoaded$.getValue();
  }

  load() {
    this.isLoaded$.next(true);
  }

  signIn() {
    const user = {
      accessToken: 'accessToken',
    } as facebook.AuthResponse;
    this.user$.next(user);
  }

  signOut() {
    this.user$.next(null);
  }
}
