import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { environment } from '@environments/environment';

@Injectable()
export class FBAuthService {
    public user$ = new BehaviorSubject<facebook.AuthResponse>(null);
    public isLoaded$ = new BehaviorSubject<boolean>(false);

    signIn(options: fb.LoginOptions = {
        scope: 'email',
    }) {
        FB.login(response => {
            if (response.status === 'connected') {
                this.user$.next(response.authResponse);
            } else {
                this.user$.next(null);
            }
        }, options);
    }

    signOut() {
        FB.logout(_ => {
            this.user$.next(null);
        });
    }

    load(id = 'fb-jssdk', language = 'en_US') {
        (window as any).fbAsyncInit = () => {
            FB.init({
                appId: environment.facebookAppId,
                xfbml: true,
                version: 'v2.10',
            });
            FB.AppEvents.logPageView();

            this.isLoaded$.next(true);
        };

        if (document.getElementById(id)) {
            return;
        }

        const js = document.createElement('script');
        js.id = id;
        js.src = '//connect.facebook.net/' + language + '/sdk.js';
        document.head.appendChild(js);
    }
}
