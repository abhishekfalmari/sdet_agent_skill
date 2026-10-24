import { test as base, Page } from '@playwright/test';
import { {{pascalCase pageName}}Page } from './pages/{{kebabCase pageName}}-page';

// Extend test with page objects
type TestFixtures = {
  {{camelCase pageName}}Page: {{pascalCase pageName}}Page;
};

export const test = base.extend<TestFixtures>({
  {{camelCase pageName}}Page: async ({ page }, use) => {
    const pageObj = new {{pascalCase pageName}}Page(page);
    await pageObj.goto();
    await use(pageObj);
  },
});

export { expect } from '@playwright/test';
