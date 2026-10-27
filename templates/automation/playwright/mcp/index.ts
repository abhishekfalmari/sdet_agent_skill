/**
 * Playwright MCP Module
 * Main entry point for MCP-based browser automation
 */

export {
  PlaywrightMCPClient,
  mcpClient,
  MCPSessionInfo,
  MCPToolResult
} from './mcp-client.js';

export {
  MCPSessionManager,
  createMCPSession,
  BrowserSessionConfig,
  PageSessionConfig
} from './mcp-session.js';

export {
  createSession,
  withMCPSession,
  MCPPageObject,
  createPageObject,
  WaitUtils,
  MCPAssertions,
  MCPTestData,
  defaultBrowserConfig
} from './mcp-utils.js';

export type {
  MCPSessionManager,
  PlaywrightMCPClient,
  MCPSessionInfo,
  MCPToolResult,
  BrowserSessionConfig,
  PageSessionConfig
} from './mcp-utils.js';