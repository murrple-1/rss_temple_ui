import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

export interface ResetOptions {
  token: string;
  password: string;
}

@Injectable()
export class PasswordResetTokenService {
  constructor(private http: HttpClient) {}

  request(email: string) {
    const formData = new FormData();
    formData.append('email', email);

    return this.http.post<void>(
      `${environment.apiHost}/api/passwordresettoken/request`,
      formData,
    );
  }

  reset(body: ResetOptions) {
    const formData = new FormData();
    formData.append('token', body.token);
    formData.append('password', body.password);

    return this.http.post<void>(
      `${environment.apiHost}/api/passwordresettoken/reset`,
      formData,
    );
  }
}
