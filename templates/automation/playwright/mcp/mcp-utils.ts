/**
 * Playwright MCP Utility Functions
 * Common utilities for test automation using Playwright MCP
 */

import { MCPSessionManager, BrowserSessionConfig, PageSessionConfig } from './mcp-session.js';
import { PlaywrightMCPClient, MCPSessionInfo, MCPToolResult } from './mcp-client.js';

/**
 * Default browser configuration
 */
export const defaultBrowserConfig: BrowserSessionConfig = {
  browserType: 'chromium',
  headless: process.env.HEADLESS !== 'false',
  viewport: { width: 1280, height: 720 },
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles'
};

/**
 * Create a new MCP session with default config
 */
export async function createSession(config?: Partial<BrowserSessionConfig>): Promise<MCPSessionManager> {
  const { createMCPSession } = await import('./mcp-session.js');
  return await createMCPSession({ ...defaultBrowserConfig, ...config });
}

/**
 * Execute a test with MCP session management
 */
export async function withMCPSession<T>(
  testFn: (session: MCPSessionManager) => Promise<T>,
  config?: Partial<BrowserSessionConfig>
): Promise<T> {
  const session = await createSession(config);
  try {
    return await testFn(session);
  } finally {
    await session.close();
  }
}

/**
 * Page Object helper for MCP
 */
export class MCPPageObject {
  private session: MCPSessionManager;
  private pageId: string;
  private baseUrl: string;

  constructor(session: MCPSessionManager, pageId: string, baseUrl: string = '') {
    this.session = session;
    this.pageId = pageId;
    this.baseUrl = baseUrl;
  }

  /**
   * Navigate to a path relative to baseUrl
   */
  async goto(path: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<MCPToolResult> {
    const url = this.baseUrl ? new URL(path, this.baseUrl).toString() : path;
    return await this.session.goto(this.pageId, url, waitUntil);
  }

  /**
   * Click element
   */
  async click(selector: string, options?: { button?: 'left' | 'right' | 'middle'; clickCount?: number }): Promise<MCPToolResult> {
    return await this.session.click(this.pageId, selector, options);
  }

  /**
   * Fill input
   */
  async fill(selector: string, value: string): Promise<MCPToolResult> {
    return await this.session.fill(this.pageId, selector, value);
  }

  /**
   * Wait for element
   */
  async waitFor(selector: string, options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }): Promise<MCPToolResult> {
    return await this.session.waitForSelector(this.pageId, selector, options);
  }

  /**
   * Take screenshot
   */
  async screenshot(options?: { fullPage?: boolean; path?: string }): Promise<MCPToolResult<Buffer>> {
    return await this.session.screenshot(this.pageId, options);
  }

  /**
   * Get page content
   */
  async getContent(): Promise<MCPToolResult<string>> {
    return await this.session.getContent(this.pageId);
  }

  /**
   * Evaluate script in page context
   */
  async evaluate<T>(script: string, arg?: any): Promise<MCPToolResult<T>> {
    return await this.session.evaluate<T>(this.pageId, script, arg);
  }

  /**
   * Get element text
   */
  async getText(selector: string): Promise<MCPToolResult<string>> {
    return await this.evaluate<string>(
      `(selector) => document.querySelector(selector)?.textContent?.trim() || ''`,
      selector
    );
  }

  /**
   * Get element attribute
   */
  async getAttribute(selector: string, attribute: string): Promise<MCPToolResult<string>> {
    return await this.evaluate<string>(
      `(selector, attr) => document.querySelector(selector)?.getAttribute(attr) || ''`,
      { selector, attribute }
    );
  }

  /**
   * Check if element exists
   */
  async exists(selector: string): Promise<MCPToolResult<boolean>> {
    return await this.evaluate<boolean>(
      `(selector) => !!document.querySelector(selector)`,
      selector
    );
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<MCPToolResult<boolean>> {
    return await this.evaluate<boolean>(
      `(selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }`,
      selector
    );
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string | string[]): Promise<MCPToolResult> {
    return await this.evaluate(
      `(selector, value) => {
        const select = document.querySelector(selector) as HTMLSelectElement;
        if (!select) throw new Error('Select element not found');
        const values = Array.isArray(value) ? value : [value];
        for (const opt of select.options) {
          opt.selected = values.includes(opt.value);
        }
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }`,
      { selector, value }
    );
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<MCPToolResult> {
    return await this.evaluate(
      `(selector) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error('Element not found');
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      }`,
      selector
    );
  }

  /**
   * Press key
   */
  async pressKey(selector: string, key: string): Promise<MCPToolResult> {
    return await this.evaluate(
      `(selector, key) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error('Element not found');
        el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      }`,
      { selector, key }
    );
  }
}

/**
 * Create a page object for a page
 */
export function createPageObject(session: MCPSessionManager, pageId: string, baseUrl?: string): MCPPageObject {
  return new MCPPageObject(session, pageId, baseUrl);
}

/**
 * Common wait utilities
 */
export const WaitUtils = {
  /**
   * Wait for network idle
   */
  async networkIdle(session: MCPSessionManager, pageId: string, timeout: number = 5000): Promise<MCPToolResult> {
    return await session.evaluate(pageId, `
      new Promise((resolve) => {
        let pending = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') pending--;
            if (pending <= 0) resolve();
          }
        });
        observer.observe({ entryTypes: ['resource'] });

        document.querySelectorAll('img, script, link[rel=stylesheet]').forEach(() => pending++);

        setTimeout(() => resolve(), ${timeout});
      })
    `);
  },

  /**
   * Wait for animation to complete
   */
  async animationsComplete(session: MCPSessionManager, pageId: string, timeout: number = 5000): Promise<MCPToolResult> {
    return await session.evaluate(pageId, `
      new Promise((resolve) => {
        const check = () => {
          const animations = document.getAnimations?.() || [];
          if (animations.every(a => a.playState === 'finished')) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
        setTimeout(() => resolve(), ${timeout});
      })
    `);
  }
};

/**
 * Assertion helpers for MCP
 */
export const MCPAssertions = {
  /**
   * Assert element exists
   */
  async elementExists(session: MCPSessionManager, pageId: string, selector: string, message?: string): Promise<void> {
    const result = await new MCPPageObject(session, pageId).exists(selector);
    if (!result.success || !result.data) {
      throw new Error(message || `Element not found: ${selector}`);
    }
  },

  /**
   * Assert element is visible
   */
  async elementVisible(session: MCPSessionManager, pageId: string, selector: string, message?: string): Promise<void> {
    const result = await new MCPPageObject(session, pageId).isVisible(selector);
    if (!result.success || !result.data) {
      throw new Error(message || `Element not visible: ${selector}`);
    }
  },

  /**
   * Assert element text
   */
  async elementTextEquals(session: MCPSessionManager, pageId: string, selector: string, expected: string, message?: string): Promise<void> {
    const result = await new MCPPageObject(session, pageId).getText(selector);
    if (!result.success || result.data !== expected) {
      throw new Error(message || `Element text mismatch. Expected: "${expected}", Got: "${result.data}"`);
    }
  },

  /**
   * Assert page URL
   */
  async urlEquals(session: MCPSessionManager, pageId: string, expectedUrl: string, message?: string): Promise<void> {
    const result = await session.evaluate(pageId, '() => window.location.href');
    if (!result.success || !result.data?.includes(expectedUrl)) {
      throw new Error(message || `URL mismatch. Expected to contain: "${expectedUrl}", Got: "${result.data}"`);
    }
  },

  /**
   * Assert page title
   */
  async titleEquals(session: MCPSessionManager, pageId: string, expectedTitle: string, message?: string): Promise<void> {
    const result = await session.evaluate(pageId, '() => document.title');
    if (!result.success || result.data !== expectedTitle) {
      throw new Error(message || `Title mismatch. Expected: "${expectedTitle}", Got: "${result.data}"`);
    }
  }
};

/**
 * Test data helpers for MCP
 */
export const MCPTestData = {
  /**
   * Generate random test data
   */
  random: {
    email: (prefix: string = 'test') => `${prefix}.${Date.now()}@example.com`,
    username: (prefix: string = 'user') => `${prefix}_${Math.random().toString(36).substring(7)}`,
    string: (length: number = 10) => Math.random().toString(36).substring(2, length + 2),
    number: (min: number = 0, max: number = 1000) => Math.floor(Math.random() * (max - min + 1)) + min,
    boolean: () => Math.random() > 0.5
  },

  /**
   * Fill form with test data
   */
  async fillForm(session: MCPSessionManager, pageId: string, formData: Record<string, string>): Promise<MCPToolResult[]> {
    const page = new MCPPageObject(session, pageId);
    const results: MCPToolResult[] = [];

    for (const [selector, value] of Object.entries(formData)) {
      const result = await page.fill(selector, value);
      results.push(result);
      if (!result.success) {
        console.warn(`Failed to fill ${selector}: ${result.error}`);
      }
    }

    return results;
  }
};

export { MCPSessionManager, PlaywrightMCPClient, MCPSessionInfo, MCPToolResult, BrowserSessionConfig, PageSessionConfig };
export type { MCPSessionManager, PlaywrightMCPClient, MCPSessionInfo, MCPToolResult, BrowserSessionConfig, PageSessionConfig };