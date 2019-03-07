import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@environments/environment';

@Injectable()
export class GAuthService {
  private auth2: gapi.auth2.GoogleAuth | null = null;

  user$ = new BehaviorSubject<gapi.auth2.GoogleUser | null>(null);
  isLoaded$ = new BehaviorSubject<boolean>(false);

  signIn() {
    if (this.auth2) {
      this.auth2.signIn().then(
        user => {
          this.user$.next(user);
        },
        err => {
          console.log(err);
        },
      );
    }
  }

  signOut() {
    if (this.auth2) {
      (this.auth2.signOut() as Promise<void>).then(
        () => {
          this.user$.next(null);
        },
        (err: any) => {
          console.error(err);
        },
      );
    }
  }

  load() {
    gapi.load('auth2', () => {
      gapi.auth2
        .init({
          client_id: environment.googleApiClientId,
          fetch_basic_profile: true,
        })
        .then(auth => {
          this.auth2 = auth;
          this.isLoaded$.next(true);
        });
    });
  }
}
