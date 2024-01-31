import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { ExploreService } from './explore.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const exploreService = new ExploreService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    exploreService,
  };
}

describe('ExploreService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should explore', fakeAsync(async () => {
    const { httpClientSpy, exploreService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    const tagDescriptors = await firstValueFrom(exploreService.explore());
    expect(tagDescriptors.length).toBeGreaterThanOrEqual(0);
  }));
});
