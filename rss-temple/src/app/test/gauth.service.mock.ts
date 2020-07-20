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
    this.isLoaded$.next(true);
  }

  signIn() {
    const user = {
      getAuthResponse: () => {
        return {
          id_token: 'id_token',
        };
      },
    } as gapi.auth2.GoogleUser;
    this.user$.next(user);
  }

  signOut() {
    this.user$.next(null);
  }
}
