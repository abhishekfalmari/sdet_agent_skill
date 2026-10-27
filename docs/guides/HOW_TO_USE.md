# SDET Agent Skill - How-to-Use Guide

## Quick Start

### Prerequisites

- Node.js 18+
- Claude Code CLI installed
- Playwright MCP server (for UI automation with MCP)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sdet_agent_skill

# Install dependencies
npm install

# Verify installation
node scripts/state-helpers.js summary
```

### First Run - Complete Pipeline

```bash
# 1. Analyze requirements (from Excel, Markdown, etc.)
/sdet-analyze --source requirements.xlsx

# 2. Generate test cases
/sdet-generate --template standard

# 3. Validate test cases
/sdet-validate

# 4. Generate automation with MCP (DEFAULT ENABLED)
/sdet-automate --type ui --framework playwright --useMcp true

# 5. Execute tests
/sdet-execute --env ci

# 6. Analyze results
/sdet-analyze-results

# 7. Generate reports
/sdet-report --format html
```

---

## Detailed Usage

### 1. Requirements Analysis (`/sdet-analyze`)

Analyze requirements from various sources:

```bash
# From Excel file
/sdet-analyze --source requirements.xlsx --sheet "Functional"

# From Markdown
/sdet-analyze --source requirements.md

# From Jira (requires config)
/sdet-analyze --source jira --project PROJ --jql "project = PROJ"

# From Confluence
/sdet-analyze --source confluence --space KEY --page-id 12345

# From OpenAPI/Swagger
/sdet-analyze --source api-spec.yaml --type api
```

**Output:** Structured requirements in `.claude/context/sdet-context.json` under `sdet.analyze`

### 2. Test Case Generation (`/sdet-generate`)

Generate test cases from analyzed requirements:

```bash
# Standard Excel format
/sdet-generate --template standard --output testcases.xlsx

# BDD/Gherkin format
/sdet-generate --template bdd --output testcases.feature

# Custom template
/sdet-generate --template custom --template-path ./my-template.xlsx
```

**Output:** Test cases file path stored in `sdet.generate.testcases.path`

### 3. Test Case Validation (`/sdet-validate`)

Validate test cases for completeness and traceability:

```bash
# Full validation
/sdet-validate --strict

# Quick validation
/sdet-validate --quick

# With custom rules
/sdet-validate --rules ./validation-rules.yaml
```

**Output:** Validation report and annotated test cases in `sdet.validate`

### 4. Automation Generation (`/sdet-automate`) ⭐ NEW: MCP SUPPORT

Generate automation code from validated test cases:

```bash
# UI Automation with Playwright + MCP (DEFAULT - MCP enabled)
/sdet-automate --type ui --framework playwright --pattern pom --language typescript

# UI Automation WITHOUT MCP (direct Playwright)
/sdet-automate --type ui --framework playwright --useMcp false

# API Automation
/sdet-automate --type api --framework pactum

# Security Automation
/sdet-automate --type security

# Performance Automation
/sdet-automate --type performance --framework k6

# All types
/sdet-automate --type all --framework playwright
```

**Arguments:**
| Argument | Description | Default |
|----------|-------------|---------|
| `--type` | Automation type: ui, api, security, performance, accessibility, contract, all | `all` |
| `--framework` | UI: playwright, cypress, appium, detox, maestro<br>API: pactum, k6, rest-assured, supertest | `playwright` |
| `--pattern` | Code pattern: pom, screenplay, functional, bdd | `pom` |
| `--language` | typescript, javascript, python, java, csharp | `typescript` |
| `--testDataStrategy` | fixture, factory, synthetic, parameterized | `fixture` |
| `--useMcp` | Enable Playwright MCP (ui type only) | `true` |

**Output Structure:**
```
tests/
├── ui/playwright/
│   ├── pages/              # Page objects
│   ├── tests/              # Test specs
│   ├── fixtures/           # Test fixtures
│   ├── helpers/            # Helper utilities
│   ├── mcp/                # ← NEW: MCP integration
│   │   ├── mcp-client.ts   # MCP connection client
│   │   ├── mcp-session.ts  # Browser session management
│   │   ├── mcp-utils.ts    # Page objects, assertions, test data
│   │   ├── index.ts        # Main entry point
│   │   └── mcp-example.test.ts  # Usage examples
│   └── playwright.config.ts
├── api/pactum/
├── security/
├── performance/k6/
├── accessibility/
└── contract/pact/
```

### 5. Test Execution (`/sdet-execute`)

Execute generated automation:

```bash
# Execute with MCP (uses MCP session from automate)
/sdet-execute --env ci

# Execute specific test suite
/sdet-execute --suite login --env staging

# Execute with custom config
/sdet-execute --config playwright.ci.config.ts

# Parallel execution
/sdet-execute --workers 4 --retries 2

# Headed mode for debugging
/sdet-execute --headed --debug
```

**MCP Execution Flow:**
```
If mcpEnabled=true in context:
  1. Read mcpSession from context
  2. Reconnect to MCP session
  3. Execute tests via MCP tools
  4. Collect traces/screenshots via MCP
Else:
  1. Run standard Playwright execution
```

### 6. Results Analysis (`/sdet-analyze-results`)

Analyze execution results:

```bash
# Full analysis
/sdet-analyze-results --update-testcases

# Failure analysis only
/sdet-analyze-results --failures-only

# Generate defect report
/sdet-analyze-results --defects --output defects.xlsx
```

### 7. Reporting (`/sdet-report`)

Generate various reports:

```bash
# Executive dashboard
/sdet-report --type executive --format html

# Technical report
/sdet-report --type technical --format pdf

# Trend analysis
/sdet-report --type trends --period 30d

# Custom report
/sdet-report --template ./custom-report.hbs --output report.html
```

---

## MCP Integration Guide

### Understanding MCP in This System

The Playwright MCP (Model Context Protocol) integration allows the automation to use a shared browser session managed by an MCP server, rather than launching its own browser. This provides:

- **Faster execution**: Reuse browser sessions
- **Better debugging**: Access to traces, screenshots via MCP
- **Shared state**: Multiple skills can use same browser session
- **AI-assisted debugging**: MCP tools available for inspection

### Enabling MCP (Default)

MCP is **enabled by default** for UI automation:

```bash
# This uses MCP automatically
/sdet-automate --type ui --framework playwright
```

### Disabling MCP

```bash
# Use direct Playwright instead
/sdet-automate --type ui --framework playwright --useMcp false
```

### How MCP Works in Generated Code

The generated `tests/ui/playwright/mcp/` directory contains:

#### 1. `mcp-client.ts` - Core Connection
```typescript
import { mcpClient } from './mcp';

// Check if MCP is available
const available = await mcpClient.checkMCPToolsAvailability();

// Initialize session
const session = await mcpClient.initialize('chromium');

// Use MCP for browser operations
await mcpClient.navigate('https://example.com');
await mcpClient.click('#login-button');
const screenshot = await mcpClient.screenshot({ fullPage: true });
```

#### 2. `mcp-session.ts` - Session Management
```typescript
import { createMCPSession, BrowserSessionConfig } from './mcp';

const config: BrowserSessionConfig = {
  browserType: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 720 }
};

const session = await createMCPSession(config);
await session.createPage('main', { url: 'https://example.com' });
// ... test operations
await session.close();
```

#### 3. `mcp-utils.ts` - High-Level Utilities
```typescript
import { 
  withMCPSession, 
  MCPPageObject, 
  MCPAssertions, 
  MCPTestData,
  WaitUtils 
} from './mcp';

// Automatic session management
await withMCPSession(async (session) => {
  const page = new MCPPageObject(session, 'main', 'https://example.com');
  await page.goto('/login');
  await page.fill('#username', 'user');
  await page.fill('#password', 'pass');
  await page.click('#login');
  await MCPAssertions.urlEquals(session, 'main', '/dashboard');
});

// Page Object pattern
class LoginPage {
  constructor(private page: MCPPageObject) {}
  
  async login(user: string, pass: string) {
    await this.page.fill('#username', user);
    await this.page.fill('#password', pass);
    await this.page.click('#login');
  }
}

// Test data generation
const email = MCPTestData.random.email('testuser');
const formData = {
  '#email': email,
  '#name': MCPTestData.random.string(10)
};
await MCPTestData.fillForm(session, 'pageId', formData);
```

### MCP Configuration

#### Environment Variables

```bash
# MCP Server URL (if not using default)
export PLAYWRIGHT_MCP_URL=http://localhost:3001

# Browser settings
export HEADLESS=true
export BROWSER_TYPE=chromium
export VIEWPORT_WIDTH=1280
export VIEWPORT_HEIGHT=720

# Trace collection
export COLLECT_TRACES=true
export TRACE_DIR=./test-results/traces
```

#### Playwright Config with MCP

The generated `playwright.config.ts` includes MCP-aware settings:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // MCP-aware configuration
  use: {
    // When MCP is used, these are handled by MCP server
    trace: process.env.USE_MCP ? 'off' : 'on-first-retry',
    screenshot: process.env.USE_MCP ? 'off' : 'only-on-failure',
  },
  
  // MCP-specific project
  projects: [
    {
      name: 'mcp-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // MCP handles browser launch
      },
    },
  ],
});
```

### MCP Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP tools not found | Ensure Playwright MCP server is running |
| Session creation fails | Check MCP server logs, verify browser installed |
| Tests timeout | Increase timeout in `mcp-session.ts` config |
| Traces not collected | Enable `COLLECT_TRACES=true` |

---

## Advanced Usage

### Running Specific Skills Only

```bash
# Only analyze requirements
/sdet-analyze --source reqs.xlsx

# Only generate API tests
/sdet-automate --type api --framework pactum

# Only run security scans
/sdet-automate --type security

# Only performance tests
/sdet-automate --type performance --framework k6
```

### Incremental Generation

```bash
# Only generate for new/changed test cases
/sdet-automate --incremental

# Force regenerate all
/sdet-automate --force
```

### Custom Templates

```bash
# Use custom template directory
/sdet-automate --template-dir ./my-templates

# Override specific template
/sdet-automate --template page-object ./my-page-object.ts
```

### CI/CD Integration

```yaml
# .github/workflows/sdet.yml
name: SDET Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run SDET Pipeline
        run: |
          /sdet-analyze --source requirements.xlsx
          /sdet-generate
          /sdet-validate
          /sdet-automate --type ui --framework playwright --useMcp true
          /sdet-execute --env ci
          /sdet-analyze-results
          /sdet-report --type executive --format html
      
      - name: Upload reports
        uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: test-results/
```

---

## Context Management

### Viewing Context

```bash
# Full context
node scripts/state-helpers.js load

# Summary
node scripts/state-helpers.js summary

# Specific key
node scripts/state-helpers.js get sdet.automate.mcpSession
```

### Resetting Context

```bash
# Full reset
node scripts/state-helpers.js reset full

# Reset for specific workflow
node scripts/state-helpers.js reset ui-automation
```

### Context Structure

```json
{
  "runId": "run-1708712345-abc12345",
  "startedAt": "2024-02-23T10:00:00.000Z",
  "lastSkill": "automate",
  "sdet": {
    "analyze": { "requirements": { "count": 50, "path": "reqs.json" } },
    "generate": { "testcases": { "count": 120, "path": "testcases.xlsx" } },
    "validate": { "validation": { "status": "passed", "annotated": "testcases-validated.xlsx" } },
    "automate": {
      "files": ["tests/ui/playwright/pages/LoginPage.ts", ...],
      "types": ["ui"],
      "framework": "playwright",
      "pattern": "pom",
      "language": "typescript",
      "mcpEnabled": true,
      "mcpSession": {
        "browserType": "chromium",
        "isConnected": true,
        "sessionId": "mcp-session-xyz789",
        "capabilities": ["navigate", "click", "screenshot", "evaluate"],
        "connectedAt": "2024-02-23T10:05:00.000Z"
      }
    }
  }
}
```

---

## Best Practices

### 1. Project Structure

```
my-project/
├── requirements/
│   ├── functional.xlsx
│   └── api-spec.yaml
├── testcases/
│   ├── generated.xlsx
│   └── validated.xlsx
├── tests/
│   ├── ui/playwright/
│   ├── api/pactum/
│   └── ...
├── .claude/
│   ├── context/
│   └── commands/
└── scripts/
```

### 2. Naming Conventions

- Test files: `*.spec.ts` (Playwright), `*.test.ts` (Vitest/Jest)
- Page objects: `PascalCase` (e.g., `LoginPage.ts`)
- Test data: `kebab-case` (e.g., `user-data.ts`)
- Fixtures: `*.fixture.ts`

### 3. MCP Best Practices

```typescript
// ✓ Good: Use withMCPSession for automatic cleanup
await withMCPSession(async (session) => {
  // test code
});

// ✓ Good: Reuse page objects
const loginPage = new LoginPage(session, 'login');
await loginPage.login(user, pass);

// ✗ Bad: Manual session management without cleanup
const session = await createMCPSession(config);
// ... test code
// Forgot to close!
```

### 4. Test Data Management

```typescript
// Use factories for consistent data
const user = UserFactory.create({ role: 'admin' });
const product = ProductFactory.create({ category: 'electronics' });

// Use parameterized tests
test.each([
  { browser: 'chromium', expected: true },
  { browser: 'firefox', expected: true },
  { browser: 'webkit', expected: false }
])('login works in $browser', async ({ browser, expected }) => {
  // test with different browsers
});
```

---

## Troubleshooting

### Common Commands

```bash
# Check context status
node scripts/state-helpers.js summary

# Validate context for automate
node scripts/context-helpers.js validate automate

# List all skill mappings
node scripts/context-helpers.js list

# Export automate context
node scripts/context-helpers.js export automate
```

### Debug MCP Connection

```bash
# Test MCP availability
node -e "
const { mcpClient } = require('./tests/ui/playwright/mcp');
mcpClient.checkMCPToolsAvailability().then(console.log);
"

# Check MCP session
node scripts/state-helpers.js get sdet.automate.mcpSession
```

### Reset and Retry

```bash
# Full pipeline reset
node scripts/state-helpers.js reset full

# Re-run from specific skill
/sdet-automate --type ui --force
/sdet-execute --env ci
```

---

## Examples

### Example 1: E2E Web Application Testing

```bash
# 1. Analyze requirements
/sdet-analyze --source docs/requirements.xlsx

# 2. Generate test cases
/sdet-generate --template standard

# 3. Validate
/sdet-validate --strict

# 4. Generate UI automation with MCP
/sdet-automate --type ui --framework playwright --pattern pom --useMcp true

# 5. Execute in CI
/sdet-execute --env ci --workers 4

# 6. Report
/sdet-report --type executive --format html
```

### Example 2: API Testing Only

```bash
# 1. Analyze API spec
/sdet-analyze --source api-spec.yaml --type api

# 2. Generate API test cases
/sdet-generate --template api-contract

# 3. Validate
/sdet-validate

# 4. Generate API automation
/sdet-automate --type api --framework pactum

# 5. Execute
/sdet-execute --env staging --suite api
```

### Example 3: Security Testing

```bash
# Generate security automation
/sdet-automate --type security

# Execute security scans
/sdet-execute --type security --env ci

# Generate security report
/sdet-report --type security --format sarif
```

### Example 4: Performance Testing

```bash
# Generate performance tests
/sdet-automate --type performance --framework k6

# Run load test
/sdet-execute --type load --vus 100 --duration 10m

# Run stress test
/sdet-execute --type stress --vus 500 --duration 5m

# Generate performance report
/sdet-report --type performance --format html
```

---

## FAQ

### Q: How do I know if MCP is working?

A: Check the context after automation:
```bash
node scripts/state-helpers.js get sdet.automate.mcpSession
```
Look for `"isConnected": true` and a valid `sessionId`.

### Q: Can I use MCP with other frameworks?

A: Currently MCP integration is built for Playwright. Other frameworks use direct execution.

### Q: How do I debug a failing MCP test?

A: 
1. Run with `--headed --debug` flags
2. Check MCP traces in `test-results/traces/`
3. Use `mcpClient.getTrace()` in test code
4. Check MCP server logs

### Q: Can I customize the MCP templates?

A: Yes! Templates are in `templates/automation/playwright/mcp/`. Modify them and they'll be used in next generation.

### Q: How do I run tests in parallel with MCP?

A: MCP sessions are per-test by default. For parallel execution, each worker gets its own MCP session. Configure in `playwright.config.ts`:
```typescript
workers: process.env.CI ? 4 : 1,
```

---

## Support

- **Documentation**: See `docs/architecture/DEEP_ARCHITECTURE.md`
- **Skill Reference**: See `docs/skill-reference.md`
- **Workflow Examples**: See `docs/workflow-examples.md`
- **Troubleshooting**: See `docs/troubleshooting.md`
- **Issues**: GitHub Issues

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────────┐
│                    SDET SKILL QUICK REFERENCE                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ANALYZE      /sdet-analyze --source file.xlsx                    │
│  GENERATE     /sdet-generate --template standard                  │
│  VALIDATE     /sdet-validate --strict                             │
│  AUTOMATE     /sdet-automate --type ui --useMcp true  ← DEFAULT   │
│  EXECUTE      /sdet-execute --env ci                              │
│  ANALYZE-R    /sdet-analyze-results --update-testcases            │
│  REPORT       /sdet-report --type executive --format html         │
│                                                                    │
│  MCP FLAGS:                                                       │
│    --useMcp true   (default) - Use Playwright MCP                 │
│    --useMcp false               - Direct Playwright               │
│                                                                    │
│  CONTEXT DEBUG:                                                   │
│    node scripts/state-helpers.js summary                          │
│    node scripts/state-helpers.js get sdet.automate.mcpSession     │
│    node scripts/context-helpers.js validate automate              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```