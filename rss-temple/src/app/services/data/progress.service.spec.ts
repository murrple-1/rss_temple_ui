import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { z } from 'zod';

import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { ProgressService } from './progress.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const progressService = new ProgressService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    progressService,
  };
}

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

  it('should check progress', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 'notstarted',
        totalCount: 10,
        finishedCount: 0,
      }),
    );

    let progress = await progressService
      .checkProgress('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(progress).toEqual(
      jasmine.objectContaining({
        state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
        totalCount: jasmine.any(Number),
        finishedCount: jasmine.any(Number),
      }),
    );

    httpClientSpy.get.and.returnValue(
      of({
        state: 'started',
        totalCount: 10,
        finishedCount: 4,
      }),
    );

    progress = await progressService
      .checkProgress('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(progress).toEqual(
      jasmine.objectContaining({
        state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
        totalCount: jasmine.any(Number),
        finishedCount: jasmine.any(Number),
      }),
    );

    httpClientSpy.get.and.returnValue(
      of({
        state: 'finished',
        totalCount: 10,
        finishedCount: 10,
      }),
    );

    progress = await progressService
      .checkProgress('123e4567-e89b-12d3-a456-426614174000')
      .toPromise();

    expect(progress).toEqual(
      jasmine.objectContaining({
        state: jasmine.stringMatching(/^(?:notstarted|started|finished)$/),
        totalCount: jasmine.any(Number),
        finishedCount: jasmine.any(Number),
      }),
    );
  }));

  it('should fail when JSON is not object', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(of([1]));

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `state` missing', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        totalCount: 10,
        finishedCount: 10,
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `state` type error', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 0,
        totalCount: 10,
        finishedCount: 10,
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `state` malformed', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 'badstring',
        totalCount: 10,
        finishedCount: 10,
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `totalCount` missing', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 'started',
        finishedCount: 4,
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `totalCount` type error', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 'started',
        totalCount: 'totalCount',
        finishedCount: 4,
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `finishedCount` missing', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 'started',
        totalCount: 10,
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));

  it('should fail `finishedCount` type error', fakeAsync(async () => {
    const { httpClientSpy, progressService } = setup();

    httpClientSpy.get.and.returnValue(
      of({
        state: 'started',
        totalCount: 10,
        finishedCount: 'finishedCount',
      }),
    );

    await expectAsync(
      progressService
        .checkProgress('123e4567-e89b-12d3-a456-426614174000')
        .toPromise(),
    ).toBeRejectedWithError(z.ZodError);
  }));
});
