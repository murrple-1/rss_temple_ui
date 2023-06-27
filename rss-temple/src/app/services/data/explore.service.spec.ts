import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { APISessionService } from '@app/services/api-session.service';

import { ExploreService } from './explore.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
    'put',
    'delete',
  ]);
  const apiSessionService = new APISessionService();

  const exploreService = new ExploreService(httpClientSpy, apiSessionService);

  return {
    httpClientSpy,
    apiSessionService,

    exploreService,
  };
}

describe('ExploreService', () => {
  beforeEach(() => {
    localStorage.removeItem('api-session-service:sessionId');
  });

  it('should explore', fakeAsync(async () => {
    const { httpClientSpy, exploreService } = setup();

    httpClientSpy.get.and.returnValue(of([]));

    const tagDescriptors = await exploreService.explore().toPromise();
    expect(tagDescriptors.length).toBeGreaterThanOrEqual(0);
  }));
});
