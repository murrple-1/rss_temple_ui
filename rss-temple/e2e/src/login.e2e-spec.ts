import { checkLogs } from './common.po';
import { LoginPage } from './login.po';

describe('LoginPage', () => {
  afterEach(checkLogs);

  it('should display login page', async () => {
    await LoginPage.navigateTo();
    expect(await LoginPage.getHeaderElement().getText()).toEqual(
      jasmine.stringMatching(/Welcome to.*?RSS Temple/),
    );
  });
});
