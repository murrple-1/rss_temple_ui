import { Injectable, NgZone } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable()
export class GAuthService {
    private auth2: gapi.auth2.GoogleAuth;

    public user$: BehaviorSubject<gapi.auth2.GoogleUser> = new BehaviorSubject<gapi.auth2.GoogleUser>(null);
    public isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private zone: NgZone
    ) { }

    signIn() {
        this.auth2.signIn().then(user => {
            this.zone.run(() => {
                this.user$.next(user);
            });
        }, (err) => {
            console.log(err);
        });
    }

    signOut() {
        this.auth2.signOut().then(() => {
            this.zone.run(() => {
                this.user$.next(null);
            });
        }, (err) => {
            console.error(err);
        });
    }

    loadAuth2() {
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: environment.googleApiClientId,
                fetch_basic_profile: true
            }).then((auth) => {
                this.zone.run(() => {
                    this.auth2 = auth;
                    this.isLoaded$.next(true);
                });
            },
            );
        });
    }
}
