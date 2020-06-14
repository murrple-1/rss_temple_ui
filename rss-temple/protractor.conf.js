// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

var multiCapabilities;

var chromeOptions = {
  args: ['--headless', '--disable-gpu', '--window-size=1920,1080'],
};
var firefoxOptions = {};

if (process.env.CI !== undefined) {
  multiCapabilities = [
    {
      browserName: 'chrome',
      shardTestFiles: false,
      maxInstances: 10,
      chromeOptions,
    },
    {
      browserName: 'firefox',
      'moz:firefoxOptions': firefoxOptions,
    },
  ];
} else {
  chromeOptions.args.push('--no-sandbox');

  multiCapabilities = [
    {
      browserName: 'chrome',
      shardTestFiles: false,
      maxInstances: 10,
      chromeOptions,
    },
  ];
}

exports.config = {
  allScriptsTimeout: 30 * 1000,
  specs: ['./e2e/**/*.e2e-spec.ts'],
  multiCapabilities,
  directConnect: true,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {},
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json',
    });

    jasmine.getEnv().addReporter(
      new SpecReporter({
        spec: { displayStacktrace: StacktraceOption.PRETTY },
      }),
    );
  },
};
