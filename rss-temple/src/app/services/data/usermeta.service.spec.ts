import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { UserMetaService } from './usermeta.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const userMetaService = new UserMetaService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    userMetaService,
  };
}

describe('UserMetaService', () => {
  it('should get read count', fakeAsync(async () => {
    const { httpClientSpy, userMetaService } = setup();

    httpClientSpy.get.and.returnValue(of(1000));

    const readCount = await userMetaService.getReadCount().toPromise();

    expect(readCount).toEqual(1000);
  }));
});
