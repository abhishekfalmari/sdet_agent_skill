/**
 * Example MCP-based Test
 * Demonstrates how to use Playwright MCP for browser automation
 */

import { test, expect } from '@playwright/test';
import {
  createSession,
  withMCPSession,
  MCPPageObject,
  MCPAssertions,
  WaitUtils,
  MCPTestData
} from '../mcp';

test.describe('MCP Integration Example', () => {
  test('should demonstrate MCP session usage', async () => {
    // Option 1: Use withMCPSession for automatic session management
    await withMCPSession(async (session) => {
      // Create a page object
      const page = new MCPPageObject(session, 'main-page', 'https://example.com');

      // Navigate to page
      await page.goto('/', 'networkidle');

      // Assert page loaded
      await MCPAssertions.titleEquals(session, 'main-page', 'Example Domain');

      // Interact with elements
      await page.waitFor('h1');
      await MCPAssertions.elementTextEquals(session, 'main-page', 'h1', 'Example Domain');

      // Take screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      expect(screenshot.success).toBe(true);
    });
  });

  test('should demonstrate manual session management', async () => {
    // Option 2: Manual session management for more control
    const session = await createSession({
      browserType: 'chromium',
      headless: true
    });

    try {
      // Create page
      await session.createPage('login-page', {
        url: 'https://example.com/login',
        waitUntil: 'networkidle'
      });

      const loginPage = new MCPPageObject(session, 'login-page');

      // Fill login form
      await loginPage.fill('#username', MCPTestData.random.username());
      await loginPage.fill('#password', 'testpassword123');
      await loginPage.click('#login-button');

      // Wait for navigation
      await WaitUtils.networkIdle(session, 'login-page');

      // Assert successful login
      await MCPAssertions.urlEquals(session, 'login-page', '/dashboard');

    } finally {
      // Always close session
      await session.close();
    }
  });

  test('should demonstrate form filling with test data', async () => {
    await withMCPSession(async (session) => {
      const page = new MCPPageObject(session, 'form-page', 'https://example.com/register');

      await page.goto('/register');

      // Fill form with generated test data
      const formData = {
        '#firstName': MCPTestData.random.string(8),
        '#lastName': MCPTestData.random.string(10),
        '#email': MCPTestData.random.email('testuser'),
        '#password': 'SecurePass123!',
        '#confirmPassword': 'SecurePass123!'
      };

      await MCPTestData.fillForm(session, 'form-page', formData);

      // Submit form
      await page.click('#submit-button');

      // Wait for submission
      await WaitUtils.networkIdle(session, 'form-page');

      // Verify success
      await MCPAssertions.elementVisible(session, 'form-page', '.success-message');
    });
  });

  test('should demonstrate evaluation in page context', async () => {
    await withMCPSession(async (session) => {
      const page = new MCPPageObject(session, 'eval-page', 'https://example.com');

      await page.goto('/');

      // Evaluate custom JavaScript in page context
      const result = await page.evaluate<{ title: string; url: string; links: number }>(`
        () => ({
          title: document.title,
          url: window.location.href,
          links: document.querySelectorAll('a').length
        })
      `);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Example Domain');
      expect(typeof result.data?.links).toBe('number');
    });
  });
});

test.describe('MCP Page Object Pattern', () => {
  // Example of a page object class using MCP
  class LoginPage {
    private page: MCPPageObject;

    constructor(session: MCPSessionManager, pageId: string) {
      this.page = new MCPPageObject(session, pageId, 'https://example.com');
    }

    async goto() {
      return await this.page.goto('/login');
    }

    async login(username: string, password: string) {
      await this.page.fill('#username', username);
      await this.page.fill('#password', password);
      await this.page.click('#login-button');
      await this.page.waitFor('.dashboard');
    }

    async isLoggedIn() {
      return await this.page.exists('.user-menu');
    }
  }

  test('should work with page object pattern', async () => {
    await withMCPSession(async (session) => {
      const loginPage = new LoginPage(session, 'login-page');

      await loginPage.goto();
      await loginPage.login('testuser', 'password123');

      const loggedIn = await loginPage.isLoggedIn();
      expect(loggedIn.data).toBe(true);
    });
  });
});