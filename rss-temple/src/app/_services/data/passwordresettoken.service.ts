import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

export interface ResetBody {
  token: string;
  password: string;
}

@Injectable()
export class PasswordResetTokenService {
  constructor(private http: HttpClient) {}

  request(email: string) {
    const params: {
      [param: string]: string | string[];
    } = {
      email: email,
    };

    return this.http.post<void>(
      `${environment.apiHost}/api/passwordresettoken/request`,
      undefined,
      {
        params: params,
      },
    );
  }

  reset(body: ResetBody) {
    return this.http.post<void>(
      `${environment.apiHost}/api/passwordresettoken/reset`,
      body,
    );
  }
}
