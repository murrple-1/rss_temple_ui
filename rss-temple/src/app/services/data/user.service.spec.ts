import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { UserService } from './user.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

  const userService = new UserService(httpClientSpy);

  return {
    httpClientSpy,

    userService,
  };
}

// TODO write tests
describe('user.service', () => {
  it('should', fakeAsync(async () => {
    const { httpClientSpy, userService } = setup();
    expect().nothing();
  }));
});
