import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { MockConfigService } from '@app/test/config.service.mock';
import { MockCookieService } from '@app/test/cookie.service.mock';

import { ClassifierLabelService } from './classifierlabel.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
  ]);
  const mockCookieService = new MockCookieService({});
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const classifierLabelService = new ClassifierLabelService(
    httpClientSpy,
    mockCookieService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    mockCookieService,
    mockConfigService,

    classifierLabelService,
  };
}

describe('ClassifierLabelService', () => {
  it('should getAll without feed entry', fakeAsync(async () => {
    const { httpClientSpy, classifierLabelService } = setup();

    const exampleClassifierLabels = [
      {
        uuid: '9dc9393a-6410-4848-9202-7ce4fd8cea61',
        text: 'Label 1',
      },
      {
        uuid: '2eea97c8-f5da-4bb2-ab98-519b6c1f1145',
        text: 'Label 2',
      },
    ];

    httpClientSpy.get.and.returnValue(of(exampleClassifierLabels));

    const classifierLabels = await firstValueFrom(
      classifierLabelService.getAll(undefined),
    );

    expect(classifierLabels).toEqual(exampleClassifierLabels);
  }));

  // TODO more tests
});
