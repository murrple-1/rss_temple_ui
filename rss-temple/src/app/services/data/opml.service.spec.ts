import { HttpClient, HttpResponse } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { SessionService } from '@app/services/session.service';

import { OPMLService } from './opml.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
  ]);
  const sessionService = new SessionService();

  const opmlService = new OPMLService(httpClientSpy, sessionService);

  return {
    httpClientSpy,
    sessionService,

    opmlService,
  };
}

describe('OPMLService', () => {
  beforeEach(() => {
    localStorage.removeItem('sessionToken');
  });

  it('should download', fakeAsync(async () => {
    const { httpClientSpy, opmlService } = setup();

    const downloadText = '<opml></opml>'; // not real OPML

    httpClientSpy.get.and.returnValue(of(downloadText));

    const xmlText = await opmlService.download().toPromise();

    expect(xmlText).toBe(downloadText);
  }));

  it('should upload text', fakeAsync(async () => {
    const { httpClientSpy, opmlService } = setup();

    const response = new HttpResponse({
      status: 200,
    });

    httpClientSpy.post.and.returnValue(of(response));

    const response_ = await opmlService.upload('<opml></opml>').toPromise();

    expect(response_.status).toBe(200);
  }));

  it('should upload buffer', fakeAsync(async () => {
    const { httpClientSpy, opmlService } = setup();

    const response = new HttpResponse({
      status: 200,
    });

    httpClientSpy.post.and.returnValue(of(response));

    const response_ = await opmlService
      .upload(new ArrayBuffer(100))
      .toPromise();

    expect(response_.status).toBe(200);
  }));
});
