import { browser, logging } from 'protractor';

export async function checkLogs() {
  const capabilities = await browser.getCapabilities();
  const browserName = capabilities.get('browserName') as string;

  switch (browserName) {
    case 'chrome': {
      const logs = await browser.manage().logs().get(logging.Type.BROWSER);
      expect(
        logs.filter(l => {
          if (/google/i.test(l.message)) {
            // allow Google errors
            return false;
          }

          if (/fb/i.test(l.message)) {
            // allow Facebook errors
            return false;
          }

          return true;
        }),
      ).not.toContain(
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
