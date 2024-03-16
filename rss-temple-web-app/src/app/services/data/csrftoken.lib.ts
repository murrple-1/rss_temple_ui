import { CookieService } from 'ngx-cookie-service';

export function createCSRFTokenFnWithService(cookieService: CookieService) {
  return () => cookieService.get('csrftoken');
}
