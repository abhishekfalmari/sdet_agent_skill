import { test, expect } from '@playwright/test';
import { {{pascalCase pageName}}Page } from '../pages/{{kebabCase pageName}}-page';

test.describe('{{pascalCase pageName}} - {{featureName}}', () => {
  let pageObj: {{pascalCase pageName}}Page;

  test.beforeEach(async ({ page }) => {
    pageObj = new {{pascalCase pageName}}Page(page);
    await pageObj.goto();
  });

  {{#each testCases}}
  test('{{title}}', async () => {
    // Test Case ID: {{testCaseId}}
    // Requirement: {{requirementId}}
    // Priority: {{priority}}

    {{#each steps}}
    // Step {{stepNumber}}: {{description}}
    {{code}}
    {{/each}}

    // Expected: {{expectedResult}}
    {{#each assertions}}
    {{code}}
    {{/each}}
  });
  {{/each}}
});
