import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';

@Injectable()
export class LoginService {
    constructor(
        private http: HttpClient,
    ) { }

    createMyLogin(email: string, password: string) {
        return this.http.post(environment.apiHost + '/api/login/my', {
            email: email,
            password: password,
        }, {
            responseType: 'text'
        }).pipe(
            map(
                _ => {
                    return true;
                }
            )
        );
    }

    createGoogleLogin(email: string, password: string, token: string) {
        return this.http.post(environment.apiHost + '/api/login/google', {
            email: email,
            password: password,
            token: token,
        }, {
            responseType: 'text'
        }).pipe(
            map(
                _ => {
                    return true;
                }
            )
        );
    }

    createFacebookLogin(email: string, password: string, token: string) {
        return this.http.post(environment.apiHost + '/api/login/facebook', {
            email: email,
            password: password,
            token: token,
        }, {
            responseType: 'text'
        }).pipe(
            map(
                _ => {
                    return true;
                }
            )
        );
    }

    getMyLoginSession(email: string, password: string) {
        return this.http.post<string | Object>(environment.apiHost + '/api/login/my/session', {
            email: email,
            password: password,
        }, {
            responseType: 'json'
        });
    }

    getGoogleLoginSession(user: gapi.auth2.GoogleUser) {
        return this.http.post<string | Object>(environment.apiHost + '/api/login/google/session', {
            token: user.getAuthResponse().id_token,
        }, {
            responseType: 'json'
        });
    }

    getFacebookLoginSession(user: facebook.AuthResponse) {
        return this.http.post<string | Object>(environment.apiHost + '/api/login/facebook/session', {
            token: user.accessToken,
        }, {
            responseType: 'json'
        });
    }
}
