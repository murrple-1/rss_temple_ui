import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { z } from 'zod';

import { ConfigService } from '@app/services/config.service';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  private http = inject(HttpClient);

  private readonly apiHost: string;

  constructor() {
    const configService = inject(ConfigService);

    const apiHost = configService.get<string>('apiHost');
    if (typeof apiHost !== 'string') {
      throw new Error('apiHost malformed');
    }

    this.apiHost = apiHost;
  }

  getKey() {
    return this.http
      .post<unknown>(`${this.apiHost}/api/captcha`, undefined)
      .pipe(map(retObj => z.string().parse(retObj)));
  }

  getImage(key: string) {
    return this.http.get(`${this.apiHost}/api/captcha/image/${key}`, {
      responseType: 'blob',
    });
  }

  getAudio(key: string) {
    return this.http.get(`${this.apiHost}/api/captcha/audio/${key}`, {
      responseType: 'blob',
    });
  }
}
