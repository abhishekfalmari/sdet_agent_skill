---
name: sdet-automate
description: Generate automation code from test cases
arguments:
  - name: type
    description: Automation type (ui, api, security, performance, accessibility, contract, all)
    required: false
    default: all
  - name: framework
    description: Framework for UI (playwright, cypress, appium, detox, maestro) or API (pactum, k6, rest-assured, supertest)
    required: false
    default: playwright
  - name: pattern
    description: Code pattern (pom, screenplay, functional, bdd)
    required: false
    default: pom
  - name: language
    description: Programming language (typescript, javascript, python, java, csharp)
    required: false
    default: typescript
  - name: testDataStrategy
    description: Test data approach (fixture, factory, synthetic, parameterized)
    required: false
    default: fixture
---

# SDET Automate Skill

## Context
You are an SDET automation engineer. Generate production-ready test code from validated test cases.

## Instructions
1. **Load context**: `node .sdet-skills/scripts/state-helpers.js load`
2. **Load validated test cases** from shared context (`sdet.testcases.path` or `sdet.validation.annotated.path`)
3. **Validate context** has test cases: `node .sdet-skills/scripts/context-helpers.js validate automate`
4. **Filter test cases** where `Automation Status` is `planned` or `automated`
5. **Group by test type** and `{{type}}` filter:
   - **UI** (`ui`): Web, desktop, hybrid apps
   - **API** (`api`): REST, GraphQL, gRPC
   - **Security** (`security`): SAST, DAST, SCA, secrets
   - **Performance** (`performance`): Load, stress, spike, soak
   - **Accessibility** (`accessibility`): WCAG, axe-core
   - **Contract** (`contract`): Consumer-driven contracts
6. **For each type**, generate automation:

### UI Automation (`ui`)
- **Framework**: `{{framework}}` (playwright, cypress, appium, detox, maestro)
- **Pattern**: `{{pattern}}` (pom, screenplay, functional, bdd)
- **Language**: `{{language}}` (typescript, javascript, python)
- **Generate**:
  - Page Objects / Screenplay tasks for each unique page/flow
  - Test specs for each test case (grouped by feature)
  - Fixtures / test data factories (`{{testDataStrategy}}`)
  - Helper utilities (waits, assertions, selectors)
  - Configuration (playwright.config.ts, cypress.config.ts)
  - CI scripts (package.json test commands)
- **Output**: `tests/ui/{{framework}}/`

### API Automation (`api`)
- **Framework**: `{{framework}}` (pactum, k6, rest-assured, supertest)
- **Generate**:
  - API client / request builders
  - Schema validation (JSON Schema, OpenAPI)
  - Test suites per endpoint/group
  - Data-driven tests with parameterization
  - Authentication helpers
  - Mock server integration (WireMock, Prism)
- **Output**: `tests/api/{{framework}}/`

### Security Automation (`security`)
- **Tools**: Semgrep (SAST), OWASP ZAP (DAST), Trivy (SCA/Container), TruffleHog (Secrets), Checkov (IaC)
- **Generate**:
  - Semgrep rules (custom + OWASP)
  - ZAP scan policies and scripts
  - Trivy scan configurations
  - Secrets detection patterns
  - IaC security checks
- **Output**: `tests/security/`

### Performance Automation (`performance`)
- **Framework**: `{{framework}}` (k6, gatling, jmeter, locust)
- **Generate**:
  - Load test scripts with thresholds
  - Scenario definitions (load, stress, spike, soak)
  - Data parameterization
  - Resource monitoring integration
  - CI/CD pipeline integration
- **Output**: `tests/performance/{{framework}}/`

### Accessibility Automation (`accessibility`)
- **Tools**: axe-core, Pa11y, Lighthouse
- **Generate**:
  - Axe-core test suites
  - Pa11y CI configuration
  - Lighthouse CI budgets
  - WCAG 2.1/2.2 AA/AAA test cases
- **Output**: `tests/accessibility/`

### Contract Automation (`contract`)
- **Framework**: Pact (JS/TS, JVM, Go, .NET), Spring Cloud Contract
- **Generate**:
  - Consumer contract tests
  - Provider verification tests
  - Pact broker publication scripts
  - Can-i-deploy checks
- **Output**: `tests/contract/`

7. **Update test cases** with `Automation ID` linking to generated files
8. **Output structure**:
   ```
   tests/
   ├── ui/playwright/
   │   ├── pages/
   │   ├── tests/
   │   ├── fixtures/
   │   ├── helpers/
   │   └── playwright.config.ts
   ├── api/pactum/
   │   ├── clients/
   │   ├── tests/
   │   ├── schemas/
   │   └── pactum.config.ts
   ├── security/
   │   ├── semgrep-rules/
   │   ├── zap-policies/
   │   └── trivy-configs/
   ├── performance/k6/
   │   ├── scenarios/
   │   ├── thresholds/
   │   └── k6.config.js
   ├── accessibility/
   │   ├── axe-tests/
   │   └── pa11y-config.json
   └── contract/pact/
       ├── consumer/
       ├── provider/
       └── pact-broker.js
   ```
9. **Update shared context**:
   ```javascript
   await saveContext('automate', {
     files: generatedFiles,
     types: selectedTypes,
     framework: '{{framework}}',
     pattern: '{{pattern}}',
     language: '{{language}}'
   });
   ```

## Shared Context Keys
- `sdet.automation.files[]`
- `sdet.automation.types[]`
- `sdet.automation.framework`
- `sdet.automation.pattern`
- `sdet.automation.language`

## Arguments Reference
- **type** (optional): Automation type - ui, api, security, performance, accessibility, contract, all. Default: all
- **framework** (optional): Framework - UI: playwright, cypress, appium, detox, maestro; API: pactum, k6, rest-assured, supertest. Default: playwright
- **pattern** (optional): Code pattern - pom, screenplay, functional, bdd. Default: pom
- **language** (optional): Language - typescript, javascript, python, java, csharp. Default: typescript
- **testDataStrategy** (optional): Test data - fixture, factory, synthetic, parameterized. Default: fixture

## Output
- `tests/<type>/<framework>/` - Generated automation code
- Updated test cases with Automation ID links
- Updated shared context with automation metadata

## Example Usage
```bash
/sdet-automate --type ui --framework playwright --pattern pom --language typescript
/sdet-automate --type api --framework pactum --testDataStrategy factory
/sdet-automate --type security --framework all
/sdet-automate --type all --framework playwright
```

## Implementation Notes
- Use `node .sdet-skills/scripts/state-helpers.js load` to load context
- Use `node .sdet-skills/scripts/state-helpers.js save sdet-automate {...}` to save
- Use templates from `templates/automation/<framework>/`
- Follow framework best practices (selectors, waits, assertions)
- Generate maintainable, readable, scalable code
- Include comprehensive comments and documentation
- Support incremental generation (only new/changed test cases)