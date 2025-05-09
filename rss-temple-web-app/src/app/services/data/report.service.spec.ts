import { HttpClient, HttpResponse } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { ReportService } from './report.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const reportService = new ReportService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    reportService,
  };
}

describe('ReportService', () => {
  it('should report feeds', fakeAsync(async () => {
    const { httpClientSpy, reportService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      reportService.reportFeed(
        '9dc9393a-6410-4848-9202-7ce4fd8cea61',
        'A reason to report',
      ),
      {
        defaultValue: undefined,
      },
    );

    expect().nothing();
  }));

  it('should report feed entries', fakeAsync(async () => {
    const { httpClientSpy, reportService } = setup();

    httpClientSpy.post.and.returnValue(of());

    await firstValueFrom(
      reportService.reportFeedEntry(
        '2eea97c8-f5da-4bb2-ab98-519b6c1f1145',
        'A reason to report',
      ),
      {
        defaultValue: undefined,
      },
    );

    expect().nothing();
  }));
});
