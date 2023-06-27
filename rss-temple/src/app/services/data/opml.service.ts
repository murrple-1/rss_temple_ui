import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { APISessionService } from '@app/services/api-session.service';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OPMLService {
  constructor(
    private http: HttpClient,
    private apiSessionService: APISessionService,
  ) {}

  download(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.apiSessionService.sessionId$.getValue(),
    );

    return this.http.get(`${environment.envVar.API_HOST}/api/opml`, {
      headers,
      responseType: 'text',
    });
  }

  upload(opmlText: string | ArrayBuffer, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.apiSessionService.sessionId$.getValue(),
    );

    return this.http.post(`${environment.envVar.API_HOST}/api/opml`, opmlText, {
      headers,
      observe: 'response',
    });
  }
}
