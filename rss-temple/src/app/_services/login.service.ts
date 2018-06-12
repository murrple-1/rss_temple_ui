import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class LoginService {
    constructor(private http: HttpClient) { }

    createMyLogin(email: string, password: string) {
        return this.http.post(environment.apiHost + '/api/login/my', { email: email, password: password });
    }

    getMyLoginSession(email: string, password: string) {
        return this.http.post(environment.apiHost + '/api/login/my/session', { email: email, password: password }, {
            responseType: 'text'
        });
    }
}
