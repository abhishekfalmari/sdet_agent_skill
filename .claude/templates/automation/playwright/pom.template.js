/**
 * Playwright Page Object Model Template
 * Generates a standard POM structure for UI tests
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Register helpers
Handlebars.registerHelper('pascalCase', (str) => {
  return str.split(/[-_\s]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
});

Handlebars.registerHelper('camelCase', (str) => {
  const pascal = str.split(/[-_\s]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
});

const templates = {
  // Base page object
  'base-page.ts': `import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page, baseURL: string = '') {
    this.page = page;
    this.baseURL = baseURL;
  }

  async goto(path: string = '') {
    await this.page.goto(\`\${this.baseURL}\${path}\`);
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
    return await this.page.screenshot({ path: \`test-results/screenshots/\${name}-\${Date.now()}.png\`, fullPage: true });
  }
}
`,

  // Page object template
  'page-object.ts': `import { Page, Locator, expect } from '@playwright/test';
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
`,

  // Test file template
  'test-file.ts': `import { test, expect } from '@playwright/test';
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
`,

  // Test data fixture
  'test-data.ts': `export interface {{pascalCase entityName}}Data {
  {{#each fields}}
  {{camelCase name}}: {{type}};
  {{/each}}
}

export const {{camelCase entityName}}TestData: {{pascalCase entityName}}Data[] = [
  {{#each dataSets}}
  {
    {{#each fields}}
    {{camelCase name}}: {{value}},
    {{/each}}
  },
  {{/each}}
];

// Helper to get test data by key
export function get{{pascalCase entityName}}Data(key: string): {{pascalCase entityName}}Data | undefined {
  return {{camelCase entityName}}TestData.find(d => d.{{camelCase primaryKey}} === key);
}
`,

  // Fixtures
  'fixtures.ts': `import { test as base, Page } from '@playwright/test';
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
`,

  // Config
  'playwright.config.ts': `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  expect: {
    toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 100 }
  }
});
`,

  // Global setup/teardown
  'global-setup.ts': `import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Start test database
  try {
    execSync('docker-compose -f docker-compose.test.yml up -d db', { stdio: 'inherit' });
    console.log('✅ Test database started');
  } catch (e) {
    console.warn('⚠️ Could not start test database:', e.message);
  }

  // Run migrations
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied');
  } catch (e) {
    console.warn('⚠️ Could not run migrations:', e.message);
  }

  // Seed test data
  try {
    execSync('npm run seed:test', { stdio: 'inherit' });
    console.log('✅ Test data seeded');
  } catch (e) {
    console.warn('⚠️ Could not seed test data:', e.message);
  }

  // Warm up application
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch(baseURL);
    console.log('✅ Application warmed up');
  } catch (e) {
    console.warn('⚠️ Could not warm up application:', e.message);
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
`,

  'global-teardown.ts': `import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Stop test database
  try {
    execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
    console.log('✅ Test database stopped');
  } catch (e) {
    console.warn('⚠️ Could not stop test database:', e.message);
  }

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
`,

  // Auth helper
  'auth-helper.ts': `import { Page, BrowserContext } from '@playwright/test';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class AuthHelper {
  private static tokenCache: Map<string, AuthTokens> = new Map();

  static async login(page: Page, credentials: AuthCredentials): Promise<AuthTokens> {
    const cacheKey = credentials.email;
    const cached = this.tokenCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now() + 60000) {
      // Use cached token
      await this.setAuthState(page.context(), cached);
      return cached;
    }

    // Perform login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', credentials.email);
    await page.fill('[data-testid="password-input"]', credentials.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');

    // Extract tokens from localStorage or cookies
    const tokens = await this.extractTokens(page);
    this.tokenCache.set(cacheKey, tokens);

    return tokens;
  }

  static async setAuthState(context: BrowserContext, tokens: AuthTokens) {
    await context.addCookies([{
      name: 'access_token',
      value: tokens.accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false
    }]);
  }

  static async extractTokens(page: Page): Promise<AuthTokens> {
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    const expiresAt = Date.now() + 3600000; // 1 hour default

    return {
      accessToken: accessToken || '',
      refreshToken: refreshToken || undefined,
      expiresAt
    };
  }

  static async logout(page: Page) {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('**/login');
    this.tokenCache.clear();
  }
}
`,

  // API helper
  'api-helper.ts': `import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async get(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(url, { headers: this.defaultHeaders(headers) });
  }

  async post(url: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(url, { data, headers: this.defaultHeaders(headers) });
  }

  async put(url: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.put(url, { data, headers: this.defaultHeaders(headers) });
  }

  async patch(url: string, data: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.patch(url, { data, headers: this.defaultHeaders(headers) });
  }

  async delete(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.delete(url, { headers: this.defaultHeaders(headers) });
  }

  private defaultHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
  }

  async expectSuccess(response: APIResponse, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    return response.json();
  }

  async expectError(response: APIResponse, expectedStatus: number, expectedMessage?: string) {
    expect(response.status()).toBe(expectedStatus);
    if (expectedMessage) {
      const body = await response.json();
      expect(body.message).toContain(expectedMessage);
    }
  }
}
`
};

async function generateTemplates(outputDir) {
  for (const [fileName, content] of Object.entries(templates)) {
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, content);
    console.log(`Generated: ${filePath}`);
  }
}

// Run if executed directly
if (require.main === module) {
  const outputDir = process.argv[2] || 'templates/automation/playwright';
  generateTemplates(outputDir).catch(console.error);
}

module.exports = { templates, generateTemplates };