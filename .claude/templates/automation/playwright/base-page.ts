import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page, baseURL: string = '') {
    this.page = page;
    this.baseURL = baseURL;
  }

  async goto(path: string = '') {
    await this.page.goto(`${this.baseURL}${path}`);
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async click(locator: Locator) {
    await this.waitForElement(locator);
    await locator.click();
  }

  async fill(locator: Locator, value: string) {
    await this.waitForElement(locator);
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string) {
    await this.waitForElement(locator);
    await locator.selectOption(value);
  }

  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return (await locator.textContent())?.trim() || '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async takeScreenshot(name: string) {
    return await this.page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png`, fullPage: true });
  }
}
