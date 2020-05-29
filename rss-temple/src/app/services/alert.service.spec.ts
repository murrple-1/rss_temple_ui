import { SnackbarService } from 'ngx-snackbar';

import { AlertService } from './alert.service';

function setup() {
  const snackbarServiceSpy = jasmine.createSpyObj<SnackbarService>(
    'SnackbarService',
    ['add'],
  );

  const alertService = new AlertService(snackbarServiceSpy);

  return {
    snackbarServiceSpy,
    alertService,
  };
}

describe('AlertService', () => {
  it('should call `error`', () => {
    const { snackbarServiceSpy, alertService } = setup();

    let text = 'text';
    let timeoutMilliseconds: number | undefined = undefined;
    alertService.error(text, timeoutMilliseconds);

    expect(snackbarServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        msg: text,
        customClass: 'error',
        timeout: timeoutMilliseconds,
      }),
    );

    snackbarServiceSpy.add.calls.reset();
    timeoutMilliseconds = 3000;

    alertService.error(text, timeoutMilliseconds);

    expect(snackbarServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        msg: text,
        customClass: 'error',
        timeout: timeoutMilliseconds,
      }),
    );
  });

  it('should call `success`', () => {
    const { snackbarServiceSpy, alertService } = setup();

    let text = 'text';
    let timeoutMilliseconds: number | undefined = undefined;
    alertService.success(text, timeoutMilliseconds);

    expect(snackbarServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        msg: text,
        customClass: 'success',
        timeout: timeoutMilliseconds,
      }),
    );

    snackbarServiceSpy.add.calls.reset();
    timeoutMilliseconds = 3000;

    alertService.success(text, timeoutMilliseconds);

    expect(snackbarServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        msg: text,
        customClass: 'success',
        timeout: timeoutMilliseconds,
      }),
    );
  });

  it('should call `info`', () => {
    const { snackbarServiceSpy, alertService } = setup();

    let text = 'text';
    let timeoutMilliseconds: number | undefined = undefined;
    alertService.info(text, timeoutMilliseconds);

    expect(snackbarServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        msg: text,
        customClass: 'info',
        timeout: timeoutMilliseconds,
      }),
    );

    snackbarServiceSpy.add.calls.reset();
    timeoutMilliseconds = 3000;

    alertService.info(text, timeoutMilliseconds);

    expect(snackbarServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        msg: text,
        customClass: 'info',
        timeout: timeoutMilliseconds,
      }),
    );
  });
});
