import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { ExploreService } from './explore.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const exploreService = new ExploreService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    exploreService,
  };
}

describe('ExploreService', () => {
  it('should explore', fakeAsync(async () => {
    const { httpClientSpy, exploreService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    const tagDescriptors = await firstValueFrom(exploreService.explore());
    expect(tagDescriptors.length).toBeGreaterThanOrEqual(0);
  }));
});
