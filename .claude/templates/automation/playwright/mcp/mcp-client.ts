/**
 * Playwright MCP Client
 * Handles connection to Playwright MCP server for browser automation
 */

import { Page, Browser, BrowserContext } from '@playwright/test';

export interface MCPSessionInfo {
  browserType: 'chromium' | 'firefox' | 'webkit';
  isConnected: boolean;
  sessionId?: string;
  capabilities: string[];
  connectedAt: Date;
}

export interface MCPToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class PlaywrightMCPClient {
  private sessionInfo: MCPSessionInfo | null = null;
  private mcpToolsAvailable: boolean = false;

  /**
   * Check if Playwright MCP tools are available in the current environment
   */
  async checkMCPToolsAvailability(): Promise<boolean> {
    try {
      // Check if mcp__playwright__ tools are available
      // This is a runtime check - in Claude Code environment, MCP tools are injected
      this.mcpToolsAvailable = typeof globalThis !== 'undefined' &&
        (globalThis as any).mcp__playwright__ !== undefined;

      return this.mcpToolsAvailable;
    } catch {
      this.mcpToolsAvailable = false;
      return false;
    }
  }

  /**
   * Initialize MCP connection and create browser session
   */
  async initialize(browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<MCPSessionInfo> {
    const available = await this.checkMCPToolsAvailability();

    if (!available) {
      console.warn('Playwright MCP tools not available. Falling back to direct Playwright.');
      return this.createFallbackSession(browserType);
    }

    try {
      // Use MCP tool to create browser session
      const mcp = (globalThis as any).mcp__playwright__;

      const session = await mcp.browser.createSession({
        browserType,
        headless: process.env.HEADLESS !== 'false',
        viewport: { width: 1280, height: 720 }
      });

      this.sessionInfo = {
        browserType,
        isConnected: true,
        sessionId: session.sessionId,
        capabilities: session.capabilities || [],
        connectedAt: new Date()
      };

      console.log(`MCP Session created: ${this.sessionInfo.sessionId}`);
      return this.sessionInfo;
    } catch (error) {
      console.error('Failed to initialize MCP session:', error);
      return this.createFallbackSession(browserType);
    }
  }

  /**
   * Create a fallback session using direct Playwright
   */
  private createFallbackSession(browserType: 'chromium' | 'firefox' | 'webkit'): MCPSessionInfo {
    this.sessionInfo = {
      browserType,
      isConnected: false,
      capabilities: ['direct-playwright'],
      connectedAt: new Date()
    };
    return this.sessionInfo;
  }

  /**
   * Get current session info
   */
  getSessionInfo(): MCPSessionInfo | null {
    return this.sessionInfo;
  }

  /**
   * Check if MCP is connected
   */
  isMCPConnected(): boolean {
    return this.sessionInfo?.isConnected ?? false;
  }

  /**
   * Navigate to URL using MCP
   */
  async navigate(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<MCPToolResult> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.navigate(this.sessionInfo!.sessionId!, url, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Click element using MCP
   */
  async click(selector: string, options?: { button?: 'left' | 'right' | 'middle'; clickCount?: number }): Promise<MCPToolResult> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.click(this.sessionInfo!.sessionId!, selector, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Fill input using MCP
   */
  async fill(selector: string, value: string): Promise<MCPToolResult> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.fill(this.sessionInfo!.sessionId!, selector, value);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Take screenshot using MCP
   */
  async screenshot(options?: { fullPage?: boolean; path?: string }): Promise<MCPToolResult<Buffer>> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.screenshot(this.sessionInfo!.sessionId!, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get page content using MCP
   */
  async getContent(): Promise<MCPToolResult<string>> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.getContent(this.sessionInfo!.sessionId!);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Execute JavaScript in page context using MCP
   */
  async evaluate<T>(script: string, arg?: any): Promise<MCPToolResult<T>> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.evaluate(this.sessionInfo!.sessionId!, script, arg);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Wait for selector using MCP
   */
  async waitForSelector(selector: string, options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }): Promise<MCPToolResult> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.page.waitForSelector(this.sessionInfo!.sessionId!, selector, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Close MCP session
   */
  async close(): Promise<void> {
    if (!this.isMCPConnected()) {
      return;
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      await mcp.browser.closeSession(this.sessionInfo!.sessionId!);
      this.sessionInfo!.isConnected = false;
      console.log('MCP Session closed');
    } catch (error) {
      console.error('Error closing MCP session:', error);
    }
  }

  /**
   * Get trace using MCP
   */
  async getTrace(): Promise<MCPToolResult> {
    if (!this.isMCPConnected()) {
      return { success: false, error: 'MCP not connected' };
    }

    try {
      const mcp = (globalThis as any).mcp__playwright__;
      const result = await mcp.browser.getTrace(this.sessionInfo!.sessionId!);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

// Singleton instance
export const mcpClient = new PlaywrightMCPClient();