import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthStateService } from '@app/services/auth-state.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { ExploreService } from './explore.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const authStateService = new AuthStateService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const exploreService = new ExploreService(
    httpClientSpy,
    authStateService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authStateService,
    mockConfigService,

    exploreService,
  };
}

describe('ExploreService', () => {
  beforeEach(() => {
    AuthStateService.removeCSRFTokenFromStorage();
  });

  it('should explore', fakeAsync(async () => {
    const { httpClientSpy, exploreService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    const tagDescriptors = await firstValueFrom(exploreService.explore());
    expect(tagDescriptors.length).toBeGreaterThanOrEqual(0);
  }));
});
