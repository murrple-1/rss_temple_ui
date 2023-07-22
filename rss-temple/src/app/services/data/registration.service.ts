import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(private http: HttpClient) {}

  register(email: string, password: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/registration`,
      {
        email,
        password1: password,
        password2: password,
      },
    );
  }

  verifyEmail(key: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/registration/verifyemail`,
      {
        key,
      },
    );
  }

  resendEmailVerification(email: string) {
    return this.http.post<void>(
      `${environment.envVar.API_HOST}/api/registration/resendemail`,
      {
        email,
      },
    );
  }
}
