import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AlertService } from '@app/services/alert.service';

import { HttpErrorService } from './httperror.service';

function setup() {
  spyOn(console, 'error');

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
  it('should handle HttpErrorResponses', () => {
    const { httpErrorService, alertServiceSpy } = setup();
    const response = new HttpErrorResponse({
      status: 400,
    });

    httpErrorService.handleError(response);
    expect(alertServiceSpy.error).toHaveBeenCalledWith(
      'Unknown Error',
      jasmine.any(Number),
    );
  });

  it('should handle "no response" HttpErrorResponses', () => {
    const { httpErrorService, alertServiceSpy } = setup();
    const response = new HttpErrorResponse({
      status: 0,
    });

    httpErrorService.handleError(response);
    expect(alertServiceSpy.error).toHaveBeenCalledWith(
      'Unable to connect to server',
      jasmine.any(Number),
    );
  });

  it('should handle "session expired" HttpErrorResponses', () => {
    const { httpErrorService, alertServiceSpy, routerSpy } = setup();
    const response = new HttpErrorResponse({
      status: 401,
    });

    httpErrorService.handleError(response);
    expect(alertServiceSpy.error).toHaveBeenCalledWith(
      'Session expired',
      jasmine.any(Number),
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/login'],
      jasmine.any(Object),
    );
  });

  it('should handle arbitrary errors', () => {
    const { httpErrorService, alertServiceSpy } = setup();

    httpErrorService.handleError('something');
    expect(alertServiceSpy.error).toHaveBeenCalledWith(
      'Unknown Error',
      jasmine.any(Number),
    );
  });
});
