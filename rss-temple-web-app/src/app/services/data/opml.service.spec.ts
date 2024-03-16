import { HttpClient, HttpResponse } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { OPMLService } from './opml.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const opmlService = new OPMLService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    opmlService,
  };
}

describe('OPMLService', () => {
  it('should download', fakeAsync(async () => {
    const { httpClientSpy, opmlService } = setup();

    const downloadText = '<opml></opml>'; // not real OPML

    httpClientSpy.get.and.returnValue(of(downloadText));

    const xmlText = await firstValueFrom(opmlService.download());

    expect(xmlText).toBe(downloadText);
  }));

  it('should upload text', fakeAsync(async () => {
    const { httpClientSpy, opmlService } = setup();

    const response = new HttpResponse({
      status: 200,
    });

    httpClientSpy.post.and.returnValue(of(response));

    const response_ = await firstValueFrom(opmlService.upload('<opml></opml>'));

    expect(response_.status).toBe(200);
  }));

  it('should upload buffer', fakeAsync(async () => {
    const { httpClientSpy, opmlService } = setup();

    const response = new HttpResponse({
      status: 200,
    });

    httpClientSpy.post.and.returnValue(of(response));

    const response_ = await firstValueFrom(
      opmlService.upload(new ArrayBuffer(100)),
    );

    expect(response_.status).toBe(200);
  }));
});
