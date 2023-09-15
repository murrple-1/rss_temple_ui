import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GAuthService } from '@app/services/gauth.service';

@Injectable()
export class MockGAuthService extends GAuthService {
  user$ = new BehaviorSubject<gapi.auth2.GoogleUser | null>(null);
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
    return new Promise<gapi.auth2.GoogleUser>((resolve, _reject) => {
      const user = {
        getAuthResponse: () => ({
          id_token: 'id_token',
        }),
      } as gapi.auth2.GoogleUser;
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
