import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class GAuthService {
  private auth2: gapi.auth2.GoogleAuthBase | null = null;

  private _user$ = new BehaviorSubject<gapi.auth2.GoogleUser | null>(null);
  private _isLoaded$ = new BehaviorSubject<boolean>(false);

  user$: Observable<gapi.auth2.GoogleUser | null>;
  isLoaded$: Observable<boolean>;

  private readonly clientId: string;

  get user() {
    return this._user$.getValue();
  }

  get isLoaded() {
    return this._isLoaded$.getValue();
  }

  constructor(configService: ConfigService) {
    this.user$ = this._user$.asObservable();
    this.isLoaded$ = this._isLoaded$.asObservable();

    const clientId = configService.get<string>('googleClientId');
    if (typeof clientId === 'string') {
      this.clientId = clientId;
    } else {
      throw new Error('googleClientId malformed');
    }
  }

  signIn() {
    if (this.auth2 === null) {
      throw new Error();
    }

    return this.auth2.signIn();
  }

  signOut() {
    const auth2 = this.auth2;
    if (auth2 === null) {
      throw new Error();
    }

    return new Promise<void>((resolve, _reject) => {
      auth2.signOut();
      resolve();
    });
  }

  load() {
    return new Promise<void>((resolve, _reject) => {
      gapi.load('auth2', () => {
        gapi.auth2
          .init({
            client_id: this.clientId,
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
            resolve();
          });
      });
    });
  }
}
