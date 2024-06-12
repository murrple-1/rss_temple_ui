import { AppAlertsService } from './app-alerts.service';

function setup() {
  const appAlertsService = new AppAlertsService();

  return {
    appAlertsService,
  };
}

describe('AppAlertsService', () => {
  it('should construct', () => {
    const { appAlertsService } = setup();

    expect(appAlertsService).not.toBeNull();
  });
});
