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
    return new Promise<void>((resolve, _reject) => {
      this.isLoaded$.next(true);
      resolve();
    });
  }

  signIn() {
    return new Promise<facebook.AuthResponse>((resolve, _reject) => {
      const user = {
        accessToken: 'accessToken',
      } as facebook.AuthResponse;
      this.user$.next(user);
      resolve(user);
    });
  }

  signOut() {
    return new Promise<void>((resolve, _reject) => {
      this.user$.next(null);
      resolve();
    });
  }
}
