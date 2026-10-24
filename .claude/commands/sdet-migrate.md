---
name: sdet-migrate
description: Migrate tests between frameworks (Cypress→Playwright, JUnit→TestNG, etc.)
arguments:
  - name: from
    description: Source framework
    required: true
  - name: to
    description: Target framework
    required: true
  - name: mode
    description: Migration mode (translate, rewrite, hybrid, validate)
    required: false
    default: translate
  - name: path
    description: Path to source tests
    required: false
---

# SDET Migrate Skill

## Context
You are a Migration Engineer. Modernize test suites safely.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load source tests, configs, dependencies from context or {{path}}
2. Map {{from}} → {{to}}:
   - **Cypress → Playwright**: Commands, selectors, fixtures, plugins, custom commands
   - **JUnit → TestNG**: Annotations, runners, data providers, listeners, groups
   - **Selenium → Playwright**: WebDriver → CDP, Page Object patterns, waits
   - **Postman → Pactum/k6**: Collections → code, environments, pre-request scripts
   - **SoapUI → REST Assured**: Projects → code, assertions, data-driven tests
   - **Mocha → Vitest/Jest**: Hooks, reporters, mocking, snapshot testing
   - **Robot Framework → Playwright**: Keywords → TypeScript, variables, libraries
   - **TestCafe → Playwright**: Selectors, assertions, hooks, roles
   - **Puppeteer → Playwright**: API parity, browser contexts, tracing
   - **Protractor → Playwright**: Angular-specific, control flow, element finders
3. {{mode}}:
   - **translate**: AST-based syntactic translation (babel, recast, jscodeshift)
   - **rewrite**: LLM-based semantic rewrite (better idioms, modern patterns)
   - **hybrid**: Translate + LLM polish (recommended)
   - **validate**: Run both, compare results, report diffs
4. Transformation rules per framework pair:
   - Selector strategy mapping (CSS → Playwright locators, XPath → getByRole)
   - Assertion library conversion (Chai → expect, AssertJ → expect)
   - Async/await normalization
   - Fixture/data migration (JSON, CSV, database)
   - Custom command/keyword translation
   - Plugin/extension equivalents
   - Configuration migration (CI, reporters, parallel)
5. Verify: Run migrated tests against baseline, compare results ({{mode}}=validate)
6. Output:
   - Migrated test code in target framework structure
   - Migration report (translated, rewritten, manual-review, failed)
   - Unverified list with reasons
   - Mapping documentation for team reference
7. Update shared context

## Shared Context Keys
- `sdet.migrate.files[]` (sourcePath, targetPath, status, mode)
- `sdet.migrate.report.path`
- `sdet.migrate.unverified[]` (file, reason, suggestedAction)
- `sdet.migrate.mapping.documentation.path`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| from | string | true | | Source framework |
| to | string | true | | Target framework |
| mode | string | false | translate | Migration mode (translate, rewrite, hybrid, validate) |
| path | string | false | | Path to source tests |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-migrate '{"files":[],"reportPath":"","unverified":[],"mappingDocPath":""}'
```

## Output
- Migrated test code
- Migration report
- Unverified list
- Mapping documentation