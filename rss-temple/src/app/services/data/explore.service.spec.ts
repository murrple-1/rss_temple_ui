import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { SessionService } from '@app/services/session.service';

import { ExploreService } from './explore.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const sessionService = new SessionService();

  const exploreService = new ExploreService(httpClientSpy, sessionService);

  return {
    httpClientSpy,
    sessionService,

    exploreService,
  };
}

describe('ExploreService', () => {
  beforeEach(() => {
    localStorage.removeItem('session-service:sessionToken');
  });

  it('should explore', fakeAsync(async () => {
    const { httpClientSpy, exploreService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    const tagDescriptors = await exploreService.explore().toPromise();
    expect(tagDescriptors.length).toBeGreaterThanOrEqual(0);
  }));
});
