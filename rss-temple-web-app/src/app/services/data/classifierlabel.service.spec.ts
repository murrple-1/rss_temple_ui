import { HttpClient, HttpResponse } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthTokenService } from '@app/services/auth-token.service';
import { MockConfigService } from '@app/test/config.service.mock';

import { ClassifierLabelService } from './classifierlabel.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', [
    'get',
    'post',
  ]);
  const authTokenService = new AuthTokenService();
  const mockConfigService = new MockConfigService({
    apiHost: '',
  });

  const classifierLabelService = new ClassifierLabelService(
    httpClientSpy,
    authTokenService,
    mockConfigService,
  );

  return {
    httpClientSpy,
    authTokenService,
    mockConfigService,

    classifierLabelService,
  };
}

describe('ClassifierLabelService', () => {
  beforeEach(() => {
    localStorage.removeItem('auth-token-service:authToken');
  });

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
