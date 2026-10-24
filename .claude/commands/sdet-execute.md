---
name: sdet-execute
description: Execute automation tests with orchestration
arguments:
  - name: type
    description: Test type to execute (ui, api, security, performance, accessibility, contract, all)
    required: false
    default: all
  - name: parallel
    description: Max parallel workers
    required: false
    default: 4
  - name: retry
    description: Retry count for flaky tests
    required: false
    default: 2
  - name: shard
    description: Shard strategy (duration, count, file, size)
    required: false
    default: duration
  - name: timeout
    description: Global timeout in minutes
    required: false
    default: 60
  - name: environment
    description: Target environment (local, dev, staging, production)
    required: false
    default: local
  - name: headed
    description: Run UI tests in headed mode
    required: false
    default: false
---

# SDET Execute Skill

## Context
You are an SDET test executor. Run tests reliably with full observability and artifact collection.

## Instructions
1. **Load context**: `node .claude/scripts/state-helpers.js load`
2. **Load automation files** from shared context (`sdet.automation.files[]`)
3. **Validate context** has automation: `node .claude/scripts/context-helpers.js validate execute`
4. **Discover test files** by type:
   - UI: `tests/ui/**/*.spec.ts`, `tests/ui/**/*.test.ts`
   - API: `tests/api/**/*.spec.ts`, `tests/api/**/*.test.ts`
   - Security: `tests/security/**/*`, config files
   - Performance: `tests/performance/**/*.js`, `tests/performance/**/*.ts`
   - Accessibility: `tests/accessibility/**/*.spec.ts`
   - Contract: `tests/contract/**/*.spec.ts`
5. **Apply sharding** (`{{shard}}`):
   - `duration`: Balance by historical duration
   - `count`: Equal test count per shard
   - `file`: One file per shard
   - `size`: Balance by file size
6. **Execute by type** with `{{parallel}}` workers:

### UI Tests (Playwright/Cypress/Appium)
```bash
# Playwright
npx playwright test --workers={{parallel}} --retries={{retry}} --shard={{shardIndex}}/{{totalShards}} --headed={{headed}}

# Cypress
npx cypress run --parallel --spec "tests/ui/cypress/**/*.cy.ts" --env retries={{retry}}

# Appium
npx wdio run --workers={{parallel}} --spec tests/ui/appium/**/*.spec.ts
```

### API Tests (Pactum/k6/REST Assured)
```bash
# Pactum
npx playwright test tests/api/pactum --workers={{parallel}}

# k6
k6 run --vus={{parallel}} --iterations=100 tests/api/k6/scenario.js

# REST Assured (Maven/Gradle)
mvn test -Dtest=ApiTestSuite -Dparallel={{parallel}}
```

### Security Tests
```bash
# Semgrep
semgrep scan --config=tests/security/semgrep-rules --json=artifacts/results/security/semgrep-results.json

# OWASP ZAP
zap-api-scan.py -t {{target}} -f openapi -r artifacts/results/security/zap-report.html

# Trivy
trivy fs --format json --output artifacts/results/security/trivy-results.json tests/
```

### Performance Tests (k6)
```bash
k6 run --out json=artifacts/results/performance/k6-results.json tests/performance/k6/scenario.js
```

### Accessibility Tests
```bash
npx playwright test tests/accessibility/axe-tests --workers={{parallel}}
```

### Contract Tests (Pact)
```bash
# Consumer
npx playwright test tests/contract/consumer --workers={{parallel}}
# Provider verification
npx @pact-foundation/pact-cli verify --provider-base-url={{url}} --pact-urls={{pactFiles}}
```

7. **Collect artifacts** for each run:
   - JUnit XML: `artifacts/results/<type>/junit-<timestamp>.xml`
   - JSON Results: `artifacts/results/<type>/results-<timestamp>.json`
   - Allure Results: `artifacts/results/<type>/allure-<timestamp>/`
   - Screenshots: `artifacts/results/<type>/screenshots/`
   - Videos: `artifacts/results/<type>/videos/`
   - Traces: `artifacts/results/<type>/traces/`
   - Logs: `artifacts/results/<type>/logs/`
   - Coverage: `artifacts/coverage/<type>/`
8. **Detect flaky tests**: Tests that pass on retry after initial failure
9. **Aggregate results** across all types:
   ```json
   {
     "summary": {
       "total": 500,
       "passed": 480,
       "failed": 15,
       "skipped": 5,
       "flaky": 3,
       "duration": 420
     },
     "byType": {
       "ui": { "passed": 200, "failed": 5, ... },
       "api": { "passed": 150, "failed": 3, ... }
     },
     "flakyTests": [...],
     "slowestTests": [...],
     "artifacts": { "junit": [...], "screenshots": [...], ... }
   }
   ```
10. **Save aggregated results** to `artifacts/results/execution-summary-{{timestamp}}.json`
11. **Update shared context**:
    ```javascript
    await saveContext('execute', {
      resultsPath: summaryPath,
      summary: aggregatedSummary,
      artifacts: artifactPaths,
      flakyTests: flakyList
    });
    ```

## Shared Context Keys
- `sdet.execution.results.path`
- `sdet.execution.summary` (passed, failed, skipped, flaky, duration)
- `sdet.execution.artifacts[]`
- `sdet.execution.flakyTests[]`

## Arguments Reference
- **type** (optional): Test type - ui, api, security, performance, accessibility, contract, all. Default: all
- **parallel** (optional): Max parallel workers. Default: 4
- **retry** (optional): Retry count for flaky tests. Default: 2
- **shard** (optional): Shard strategy - duration, count, file, size. Default: duration
- **timeout** (optional): Global timeout in minutes. Default: 60
- **environment** (optional): Target environment - local, dev, staging, production. Default: local
- **headed** (optional): Run UI tests in headed mode. Default: false

## Output
- `artifacts/results/<type>/` - Test results and artifacts per type
- `artifacts/results/execution-summary-<timestamp>.json` - Aggregated summary
- Updated shared context with execution results

## Example Usage
```bash
/sdet-execute --type ui --parallel 4 --retry 2 --shard duration
/sdet-execute --type all --parallel 8 --environment staging
/sdet-execute --type performance --timeout 120
```

## Implementation Notes
- Use `node .claude/scripts/state-helpers.js load` to load context
- Use `node .claude/scripts/state-helpers.js save sdet-execute {...}` to save
- Support dry-run mode for validation
- Implement graceful shutdown on interruption
- Collect metrics: CPU, memory, network per test run
- Generate Allure reports for visualization
- Track historical trends for flakiness detection