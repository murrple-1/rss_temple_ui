import { browser, logging } from 'protractor';

export async function checkLogs() {
  const capabilities = await browser.getCapabilities();
  const browserName = capabilities.get('browserName') as string;

  switch (browserName) {
    case 'chrome': {
      const logs = await browser.manage().logs().get(logging.Type.BROWSER);
      expect(logs).not.toContain(
        jasmine.objectContaining({
          level: logging.Level.SEVERE,
        }),
      );
      break;
    }
    case 'firefox': {
      // do nothing
      break;
    }
    default: {
      throw new Error('unknown browserName');
    }
  }
}
