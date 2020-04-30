import { browser, logging } from 'protractor';

import { LoginPage } from './login.po';

describe('LoginPage', () => {
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      }),
    );
  });

  it('should display login page', async () => {
    await LoginPage.navigateTo();
    expect(await LoginPage.getHeaderElement().getText()).toEqual('Login');
  });
});
