import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GAuthService {
  private auth2: gapi.auth2.GoogleAuth | null = null;

  private _user$ = new BehaviorSubject<gapi.auth2.GoogleUser | null>(null);
  private _isLoaded$ = new BehaviorSubject<boolean>(false);

  user$: Observable<gapi.auth2.GoogleUser | null>;
  isLoaded$: Observable<boolean>;

  get user() {
    return this._user$.getValue();
  }

  get isLoaded() {
    return this._isLoaded$.getValue();
  }

  constructor() {
    this.user$ = this._user$.asObservable();
    this.isLoaded$ = this._isLoaded$.asObservable();
  }

  signIn() {
    if (this.auth2) {
      this.auth2.signIn();
    }
  }

  signOut() {
    if (this.auth2) {
      this.auth2.signOut();
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

          this.auth2.currentUser.listen(user => {
            this._user$.next(user);
          });

          this.auth2.isSignedIn.listen(signedIn => {
            if (!signedIn) {
              this._user$.next(null);
            }
          });

          this._isLoaded$.next(true);
        });
    });
  }
}
