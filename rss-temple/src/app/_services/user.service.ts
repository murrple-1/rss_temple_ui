import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models/user';

@Injectable()
export class UserService {
    constructor(private http: HttpClient) { }

    get(fields?: string[], sessionToken?: string) {
        return this.http.get(environment.apiHost + '/api/user', {
            headers: {
                'X-Session-Token': sessionToken || localStorage.getItem('sessionToken')
            },
            params: {
                'fields': (fields || ['uuid', 'email']).join(',')
            }
        }).pipe<User>(
            map(value => {
                let user: User = {};

                if('uuid' in value) {
                    if(typeof value['uuid'] === 'string') {
                        user.uuid = value['uuid'];
                    } else {
                        throw new Error('\'uuid\' must be string');
                    }
                }

                if('email' in value) {
                    if(typeof value['email'] === 'string') {
                        user.email = value['email'];
                    } else {
                        throw new Error('\'email\' must be string')
                    }
                }

                return user;
            })
        );
    }
}
