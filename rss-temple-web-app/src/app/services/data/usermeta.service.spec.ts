import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { UserMetaService } from './usermeta.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const userMetaService = new UserMetaService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    userMetaService,
  };
}

describe('UserMetaService', () => {
  it('should get read count', fakeAsync(async () => {
    const { httpClientSpy, userMetaService } = setup();

    httpClientSpy.get.and.returnValue(of(1000));

    const readCount = await firstValueFrom(userMetaService.getReadCount());

    expect(readCount).toEqual(1000);
  }));
});
