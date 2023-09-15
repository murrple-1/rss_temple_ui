import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FBAuthService {
  private _user$ = new BehaviorSubject<facebook.AuthResponse | null>(null);
  private _isLoaded$ = new BehaviorSubject<boolean>(false);

  user$: Observable<facebook.AuthResponse | null>;
  isLoaded$: Observable<boolean>;

  private readonly appId: string;

  get user() {
    return this._user$.getValue();
  }

  get isLoaded() {
    return this._isLoaded$.getValue();
  }

  constructor(configService: ConfigService) {
    this.user$ = this._user$.asObservable();
    this.isLoaded$ = this._isLoaded$.asObservable();

    const appId = configService.get<string>('facebookAppId');
    if (typeof appId === 'string') {
      this.appId = appId;
    } else {
      throw new Error('facebookAppId malformed');
    }
  }

  signIn(
    options: fb.LoginOptions = {
      scope: 'email',
    },
  ) {
    return new Promise<facebook.AuthResponse>((resolve, reject) => {
      FB.login(response => {
        if (response.status === 'connected') {
          this._user$.next(response.authResponse);
          resolve(response.authResponse);
        } else {
          this._user$.next(null);
          reject(response.status);
        }
      }, options);
    });
  }

  signOut() {
    return new Promise<void>((resolve, _reject) => {
      FB.getLoginStatus(response => {
        if (response.status === 'connected') {
          FB.logout(() => {
            this._user$.next(null);
            resolve();
          });
        } else {
          this._user$.next(null);
          resolve();
        }
      });
    });
  }

  load(id = 'fb-jssdk', language = 'en_US') {
    return new Promise<void>((resolve, _reject) => {
      (window as any).fbAsyncInit = () => {
        FB.init({
          appId: this.appId,
          xfbml: true,
          version: 'v2.10',
        });
        FB.AppEvents.logPageView();

        this._isLoaded$.next(true);
        resolve();
      };

      if (document.getElementById(id) !== null) {
        return;
      }

      const js = document.createElement('script');
      js.id = id;
      js.src = `//connect.facebook.net/${language}/sdk.js`;
      document.head.appendChild(js);
    });
  }
}
