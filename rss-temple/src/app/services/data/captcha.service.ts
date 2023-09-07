import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { z } from 'zod';

import { ConfigService } from '@app/services/config.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  private readonly apiHost: string;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
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
