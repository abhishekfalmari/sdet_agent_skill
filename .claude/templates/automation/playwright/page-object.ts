import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class {{pascalCase pageName}}Page extends BasePage {
  // Page URL
  readonly url = '{{pageUrl}}';

  // Locators
  {{#each locators}}
  readonly {{camelCase name}}: Locator;
  {{/each}}

  constructor(page: Page) {
    super(page, process.env.BASE_URL || 'http://localhost:3000');

    // Initialize locators
    {{#each locators}}
    this.{{camelCase name}} = this.page.locator('{{selector}}');
    {{/each}}
  }

  // Actions
  async goto() {
    await super.goto(this.url);
    await this.verifyPageLoaded();
  }

  async verifyPageLoaded() {
    // Override in subclass to verify specific elements
    await this.waitForLoad();
  }

  {{#each actions}}
  async {{camelCase name}}({{{params}}}) {
    {{#each steps}}
    {{this}}
    {{/each}}
  }
  {{/each}}

  // Assertions
  {{#each assertions}}
  async {{camelCase name}}() {
    {{#each steps}}
    {{this}}
    {{/each}}
  }
  {{/each}}
}
