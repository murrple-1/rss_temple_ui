import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable()
export class GAuthService {
    private auth2: gapi.auth2.GoogleAuth;

    public user$ = new BehaviorSubject<gapi.auth2.GoogleUser>(null);
    public isLoaded$ = new BehaviorSubject<boolean>(false);

    signIn() {
        this.auth2.signIn().then(user => {
            this.user$.next(user);
        }, (err) => {
            console.log(err);
        });
    }

    signOut() {
        this.auth2.signOut().then(() => {
            this.user$.next(null);
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
                this.isLoaded$.next(true);
            },
            );
        });
    }
}
