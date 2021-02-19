import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { SessionService } from '@app/services/session.service';

import { ProgressService } from './progress.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
  const sessionService = new SessionService();

  const progressService = new ProgressService(httpClientSpy, sessionService);

  return {
    httpClientSpy,
    sessionService,

    progressService,
  };
}

describe('ProgressService', () => {
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
    ).toBeRejectedWithError(Error, /must be object/);
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
    ).toBeRejectedWithError(Error, /state.*?missing/);
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
    ).toBeRejectedWithError(Error, /state.*?must be string/);
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
    ).toBeRejectedWithError(Error, /state.*?malformed/);
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
    ).toBeRejectedWithError(Error, /totalCount.*?missing/);
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
    ).toBeRejectedWithError(Error, /totalCount.*?must be number/);
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
    ).toBeRejectedWithError(Error, /finishedCount.*?missing/);
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
    ).toBeRejectedWithError(Error, /finishedCount.*?must be number/);
  }));
});
