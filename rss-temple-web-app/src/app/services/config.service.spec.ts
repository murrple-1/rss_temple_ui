import { HttpClient } from '@angular/common/http';

import { ConfigService } from './config.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

  const configService = new ConfigService(httpClientSpy);

  return {
    configService,
  };
}

describe('ConfigService', () => {
  it('should construct', () => {
    const { configService } = setup();

    expect(configService).not.toBeNull();
  });

  // TODO more tests
});
