import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@environments/environment';

@Injectable()
export class GAuthService {
    private auth2: gapi.auth2.GoogleAuth;

    private _user$ = new BehaviorSubject<gapi.auth2.GoogleUser>(null);
    private _isLoaded$ = new BehaviorSubject<boolean>(false);

    user$: Observable<gapi.auth2.GoogleUser>;
    isLoaded$: Observable<boolean>;

    constructor() {
        this.user$ = this._user$.asObservable();
        this.isLoaded$ = this._isLoaded$.asObservable();
    }

    signIn() {
        this.auth2.signIn().then(user => {
            this._user$.next(user);
        }, (err) => {
            console.log(err);
        });
    }

    signOut() {
        this.auth2.signOut().then(() => {
            this._user$.next(null);
        }, (err) => {
            console.error(err);
        });
    }

    load() {
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: environment.googleApiClientId,
                fetch_basic_profile: true
            }).then((auth) => {
                this.auth2 = auth;
                this._isLoaded$.next(true);
            },
            );
        });
    }
}
