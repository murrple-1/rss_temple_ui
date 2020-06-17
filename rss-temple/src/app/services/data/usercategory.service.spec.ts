import { HttpClient } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';

import { of } from 'rxjs';

import { UserCategoryService } from './usercategory.service';

function setup() {
  const httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

  const userCategoryService = new UserCategoryService(httpClientSpy);

  return {
    httpClientSpy,

    userCategoryService,
  };
}

// TODO write tests
describe('usercategory.service', () => {
  it('should', fakeAsync(async () => {
    const { httpClientSpy, userCategoryService } = setup();
    expect().nothing();
  }));
});
