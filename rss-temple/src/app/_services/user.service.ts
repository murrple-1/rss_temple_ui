import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { User } from '@app/_models/user';

import { environment } from '@environments/environment';

export type Field = 'uuid' | 'email' | 'subscribedFeedUuids';

function toUser(value: Object) {
    const user: User = {};

    if ('uuid' in value) {
        if (typeof value['uuid'] === 'string') {
            user.uuid = value['uuid'];
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('email' in value) {
        if (typeof value['email'] === 'string') {
            user.email = value['email'];
        } else {
            throw new Error('\'email\' must be string');
        }
    }

    if ('subscribedFeedUuids' in value) {
        if (value['subscribedFeedUuids'] instanceof Array) {
            value['subscribedFeedUuids'].forEach(element => {
                if (typeof element !== 'string') {
                    throw new Error('\'subscribedFeedUuids\' element must be string');
                }
            });

            user.subscribedFeedUuids = value['subscribedFeedUuids'];
        } else {
            throw new Error('\'subscribedFeedUuids\' must be array');
        }
    }

    return user;
}

@Injectable()
export class UserService {
    constructor(
        private http: HttpClient,
    ) { }

    get(fields?: Field[], sessionToken?: string) {
        return this.http.get(environment.apiHost + '/api/user', {
            headers: {
                'X-Session-Token': sessionToken || localStorage.getItem('sessionToken')
            },
            params: {
                'fields': (fields || ['uuid']).join(',')
            }
        }).pipe<User>(
            map(toUser)
        );
    }
}
