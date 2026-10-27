/**
 * Playwright MCP Session Manager
 * Manages browser sessions and context for MCP-based automation
 */

import { PlaywrightMCPClient, MCPSessionInfo, MCPToolResult } from './mcp-client.js';

export interface BrowserSessionConfig {
  browserType: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  viewport?: { width: number; height: number };
  locale?: string;
  timezoneId?: string;
  permissions?: string[];
  extraHTTPHeaders?: Record<string, string>;
}

export interface PageSessionConfig {
  url?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}

export class MCPSessionManager {
  private client: PlaywrightMCPClient;
  private sessionInfo: MCPSessionInfo | null = null;
  private pageConfigs: Map<string, PageSessionConfig> = new Map();

  constructor(client?: PlaywrightMCPClient) {
    this.client = client || new PlaywrightMCPClient();
  }

  /**
   * Initialize a new browser session
   */
  async initialize(config: BrowserSessionConfig): Promise<MCPSessionInfo> {
    this.sessionInfo = await this.client.initialize(config.browserType);
    return this.sessionInfo;
  }

  /**
   * Get current session info
   */
  getSessionInfo(): MCPSessionInfo | null {
    return this.sessionInfo || this.client.getSessionInfo();
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.client.isMCPConnected() || (this.sessionInfo?.capabilities.includes('direct-playwright') ?? false);
  }

  /**
   * Create a new page and navigate to URL
   */
  async createPage(pageId: string, config: PageSessionConfig = {}): Promise<MCPToolResult> {
    if (!this.isActive()) {
      return { success: false, error: 'No active session' };
    }

    this.pageConfigs.set(pageId, config);

    if (config.url) {
      return await this.client.navigate(config.url, { waitUntil: config.waitUntil });
    }

    return { success: true, data: { pageId } };
  }

  /**
   * Navigate existing page to URL
   */
  async goto(pageId: string, url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<MCPToolResult> {
    const config = this.pageConfigs.get(pageId) || {};
    config.url = url;
    config.waitUntil = waitUntil;
    this.pageConfigs.set(pageId, config);

    return await this.client.navigate(url, { waitUntil });
  }

  /**
   * Interact with page elements
   */
  async click(pageId: string, selector: string, options?: { button?: 'left' | 'right' | 'middle'; clickCount?: number }): Promise<MCPToolResult> {
    return await this.client.click(selector, options);
  }

  async fill(pageId: string, selector: string, value: string): Promise<MCPToolResult> {
    return await this.client.fill(selector, value);
  }

  async waitForSelector(pageId: string, selector: string, options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }): Promise<MCPToolResult> {
    return await this.client.waitForSelector(selector, options);
  }

  /**
   * Capture page state
   */
  async screenshot(pageId: string, options?: { fullPage?: boolean; path?: string }): Promise<MCPToolResult<Buffer>> {
    return await this.client.screenshot(options);
  }

  async getContent(pageId: string): Promise<MCPToolResult<string>> {
    return await this.client.getContent();
  }

  async evaluate<T>(pageId: string, script: string, arg?: any): Promise<MCPToolResult<T>> {
    return await this.client.evaluate<T>(script, arg);
  }

  /**
   * Get trace for debugging
   */
  async getTrace(): Promise<MCPToolResult> {
    return await this.client.getTrace();
  }

  /**
   * Close session and cleanup
   */
  async close(): Promise<void> {
    this.pageConfigs.clear();
    await this.client.close();
    this.sessionInfo = null;
  }

  /**
   * Get session metadata for context sharing
   */
  getSessionMetadata(): Record<string, any> {
    const info = this.getSessionInfo();
    return {
      browserType: info?.browserType,
      isMCPConnected: info?.isConnected,
      sessionId: info?.sessionId,
      capabilities: info?.capabilities,
      connectedAt: info?.connectedAt?.toISOString(),
      pageCount: this.pageConfigs.size
    };
  }
}

// Factory function for easy session creation
export async function createMCPSession(config: BrowserSessionConfig): Promise<MCPSessionManager> {
  const manager = new MCPSessionManager();
  await manager.initialize(config);
  return manager;
}