import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@app/services/config.service';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
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

  register(
    email: string,
    password: string,
    captchaKey: string,
    captchaSecretPhrase: string,
  ) {
    return this.http.post<void>(`${this.apiHost}/api/registration`, {
      email,
      password,
      captcha: `${captchaKey}:${captchaSecretPhrase}`,
    });
  }

  verifyEmail(key: string) {
    return this.http.post<void>(
      `${this.apiHost}/api/registration/verifyemail`,
      {
        key,
      },
    );
  }

  resendEmailVerification(email: string) {
    return this.http.post<void>(
      `${this.apiHost}/api/registration/resendemail`,
      {
        email,
      },
    );
  }
}
