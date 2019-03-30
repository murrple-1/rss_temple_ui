// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

var path = require('path');

var reporters = ['progress', 'kjhtml'];
var _test_type = (process.env.TEST_TYPE || 'standard').toLowerCase();
if (_test_type === 'standard') {
  // do nothing
} else if (_test_type === 'xml') {
  reporters.push('junit');
} else {
  throw new Error("unknown 'TEST_TYPE'");
}

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: path.join(__dirname, '../coverage/'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true,
    },
    junitReporter: {
      outputDir: path.join(__dirname, '../test-results/'),
    },
    reporters: reporters,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
  });
};
