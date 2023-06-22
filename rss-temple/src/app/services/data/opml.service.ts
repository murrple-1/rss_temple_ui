import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { SessionService } from '@app/services/session.service';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OPMLService {
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
  ) {}

  download(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.get(`${environment.envVar.apiHost}/api/opml`, {
      headers,
      responseType: 'text',
    });
  }

  upload(opmlText: string | ArrayBuffer, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.sessionService.sessionToken$.getValue(),
    );

    return this.http.post(`${environment.envVar.apiHost}/api/opml`, opmlText, {
      headers,
      observe: 'response',
    });
  }
}
