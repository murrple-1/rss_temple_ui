import { browser, by, element } from 'protractor';

export namespace LoginPage {
  export function navigateTo() {
    return browser.get(browser.baseUrl);
  }

  export function getTitleElement() {
    return element(by.css('app-root .login section.title'));
  }
}
