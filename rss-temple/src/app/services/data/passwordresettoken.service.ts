import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

export interface ResetOptions {
  token: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetTokenService {
  constructor(private http: HttpClient) {}

  request(email: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/auth/password/reset`,
      {
        email,
      },
    );
  }

  reset(token: string, userId: string, password: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/auth/password/reset/confirm`,
      {
        uid: userId,
        token,
        new_password1: password,
        new_password2: password,
      },
    );
  }
}
