import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { User } from '@app/_models/user';
import { sessionToken } from '@app/_modules/session.module';

import { environment } from '@environments/environment';

export type Field = 'uuid' | 'email' | 'subscribedFeedUuids';

function toUser(value: Record<string, any>) {
    const user: User = {};

    if ('uuid' in value) {
        const uuid = value['uuid'];
        if (typeof uuid === 'string') {
            user.uuid = uuid;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('email' in value) {
        const email = value['email'];
        if (typeof email === 'string') {
            user.email = email;
        } else {
            throw new Error('\'email\' must be string');
        }
    }

    if ('subscribedFeedUuids' in value) {
        const subscribedFeedUuids = value['subscribedFeedUuids'];
        if (subscribedFeedUuids instanceof Array) {
            subscribedFeedUuids.forEach(element => {
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

    get(fields?: Field[], _sessionToken?: string) {
        return this.http.get(environment.apiHost + '/api/user', {
            headers: {
                'X-Session-Token': _sessionToken || sessionToken()
            },
            params: {
                'fields': (fields || ['uuid']).join(',')
            }
        }).pipe<User>(
            map(toUser)
        );
    }
}
