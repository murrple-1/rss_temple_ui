import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { sessionToken } from '@app/libs/session.lib';
import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';

import { environment } from '@environments/environment';

@Injectable()
export class OPMLService {
  constructor(private http: HttpClient) {}

  download(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.get(`${environment.apiHost}/api/opml`, {
      headers,
      responseType: 'text',
    });
  }

  upload(opmlText: string | ArrayBuffer, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, sessionToken);

    return this.http.post(`${environment.apiHost}/api/opml`, opmlText, {
      headers,
      observe: 'response',
    });
  }
}
