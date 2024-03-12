import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthStateService } from '@app/services/auth-state.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { UserMetaService } from './usermeta.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
  const authStateService = new AuthStateService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const userMetaService = new UserMetaService(
    httpClientSpy,
    authStateService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authStateService,
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
