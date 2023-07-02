import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { AuthTokenService } from '@app/services/auth-token.service';

import { ExploreService } from './explore.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const authTokenService = new AuthTokenService();

  const exploreService = new ExploreService(httpClientSpy, authTokenService);

  return {
    httpClientSpy,
    authTokenService,

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

    const tagDescriptors = await exploreService.explore().toPromise();
    expect(tagDescriptors.length).toBeGreaterThanOrEqual(0);
  }));
});
