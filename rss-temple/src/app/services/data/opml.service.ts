import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  CommonOptions,
  toHeaders as commonToHeaders,
} from '@app/services/data/common.interface';
import { AuthTokenService } from '@app/services/auth-token.service';
import { ConfigService } from '@app/services/config.service';

@Injectable({
  providedIn: 'root',
})
export class OPMLService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService,
    configService: ConfigService,
  ) {
    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  download(options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.get(`${this.apiHost}/api/opml`, {
      headers,
      responseType: 'text',
    });
  }

  upload(opmlText: string | ArrayBuffer, options: CommonOptions = {}) {
    const headers = commonToHeaders(options, () =>
      this.authTokenService.authToken$.getValue(),
    );

    return this.http.post(`${this.apiHost}/api/opml`, opmlText, {
      headers,
      observe: 'response',
    });
  }
}
