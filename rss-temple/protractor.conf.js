// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

var chromeOptions = {
  args: ['--headless', '--disable-gpu', '--window-size=1920,1080'],
};

if (process.env.CI !== undefined) {
  chromeOptions.args.push('--no-sandbox');
}

exports.config = {
  allScriptsTimeout: 30 * 1000,
  specs: ['./e2e/**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
    shardTestFiles: false,
    maxInstances: 10,
    chromeOptions,
  },
  directConnect: true,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {},
  },
  beforeLaunch: function () {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json',
    });
  },
  onPrepare() {
    jasmine
      .getEnv()
      .addReporter(new SpecReporter({ spec: { displayStacktrace: 'pretty' } }));
  },
};
