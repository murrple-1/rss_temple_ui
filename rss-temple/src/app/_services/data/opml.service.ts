import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { sessionToken } from '@app/_modules/session.module';
import {
    CommonOptions,
    toHeader as commonToHeader,
} from '@app/_services/data/common.interface';

import { environment } from '@environments/environment';

@Injectable()
export class OPMLService {
    constructor(
        private http: HttpClient,
    ) { }

    download(options: CommonOptions = {}) {
        const headers = commonToHeader(options, sessionToken);

        return this.http.get(`${environment.apiHost}/api/opml`, {
            headers: headers,
            responseType: 'text',
        });
    }

    upload(opmlText: string | ArrayBuffer, options: CommonOptions = {}) {
        const headers = commonToHeader(options, sessionToken);

        return this.http.post<void>(`${environment.apiHost}/api/opml`, opmlText, {
            headers: headers,
        });
    }
}
