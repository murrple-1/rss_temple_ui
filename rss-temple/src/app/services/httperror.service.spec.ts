import { Router } from '@angular/router';

import { AlertService } from '@app/services/alert.service';

import { HttpErrorService } from './httperror.service';

function setup() {
  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const alertServiceSpy = jasmine.createSpyObj<AlertService>('AlertService', [
    'error',
  ]);

  const httpErrorService = new HttpErrorService(routerSpy, alertServiceSpy);

  return {
    routerSpy,
    alertServiceSpy,
    httpErrorService,
  };
}

describe('HttpErrorService', () => {
  it('should handle errors', () => {
    const { httpErrorService } = setup();

    httpErrorService.handleError('something');
    expect().nothing();
  });

  // TODO more tests
});
