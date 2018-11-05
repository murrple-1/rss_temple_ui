import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { UserCategory } from '@app/_models/usercategory';
import { sessionToken } from '@app/_modules/session.module';
import { Objects, toObjects } from '@app/_services/data/objects';
import {
    GetOptions,
    toHeader as getToHeader,
    toParams as getToParams,
} from '@app/_services/data/get.interface';
import {
    SomeOptions,
    toHeader as someToHeader,
    toParams as someToParams,
} from '@app/_services/data/some.interface';
import { AllOptions } from '@app/_services/data/all.interface';
import { allFn } from '@app/_services/data/all.function';

import { environment } from '@environments/environment';

export type Field = 'uuid' | 'text';

function toUserCategory(value: Record<string, any>) {
    const userCategory = new UserCategory();

    if ('uuid' in value) {
        const uuid = value['uuid'];
        if (typeof uuid === 'string') {
            userCategory.uuid = uuid;
        } else {
            throw new Error('\'uuid\' must be string');
        }
    }

    if ('text' in value) {
        const text = value['text'];
        if (typeof text === 'string') {
            userCategory.text = text;
        } else {
            throw new Error('\'text\' must be string');
        }
    }

    return userCategory;
}

@Injectable()
export class UserCategoryService {
    constructor(
        private http: HttpClient,
    ) { }

    get(uuid: string, options: GetOptions<Field> = {}) {
        const headers = getToHeader(options, sessionToken);
        const params = getToParams(options, () => ['uuid']);

        return this.http.get(environment.apiHost + '/api/usercategory/' + uuid, {
            headers: headers,
            params: params,
        }).pipe<UserCategory>(
            map(toUserCategory)
        );
    }

    some(options: SomeOptions<Field> = {}) {
        const headers = someToHeader(options, sessionToken);
        const params = someToParams(options, () => ['uuid']);

        return this.http.get(environment.apiHost + '/api/usercategories', {
            headers: headers,
            params: params,
        }).pipe<Objects<UserCategory>>(
            map(retObj => toObjects<UserCategory>(retObj, toUserCategory))
        );
    }

    all(options: AllOptions<Field> = {}, pageSize = 1000) {
        return allFn(options, this.some.bind(this), toUserCategory, pageSize);
    }
}
