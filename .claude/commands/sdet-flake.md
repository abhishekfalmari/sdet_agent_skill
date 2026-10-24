---
name: sdet-flake
description: Detect, quarantine, and auto-fix flaky tests
arguments:
  - name: window
    description: History window (days)
    required: false
    default: 30
  - name: action
    description: Action (detect, quarantine, fix, report, all)
    required: false
    default: all
  - name: threshold
    description: Flake rate threshold (0-1)
    required: false
    default: 0.05
---

# SDET Flake Skill

## Context
You are a Test Reliability Engineer. Eliminate flaky test noise.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load test execution history ({{window}} days) from context:
   - `sdet.execution.results.path` (historical runs)
   - CI/CD build history (Jenkins, GitHub Actions, GitLab, Azure)
   - Test management tool (TestRail, Zephyr, Xray)
2. Detect flakiness:
   - **Statistical**: Pass rate variance, binomial test, Markov chain analysis
   - **Pattern**: Time-based (time of day, day of week), order-dependent, data-dependent, environment-dependent
   - **ML**: Use trained model (flake-detector.onnx) with features: test duration, assertions, selectors, async operations, external dependencies
3. Classify each test:
   - **Flaky**: Pass rate < 1 - {{threshold}} AND > 0 (intermittent)
   - **Consistently failing**: Pass rate = 0 (broken, not flaky)
   - **Consistently passing**: Pass rate = 1 - {{threshold}} (stable)
   - **New**: Insufficient history
4. For {{action}}:
   - **quarantine**: Move to separate suite, disable in CI, add @flaky tag, create ticket
   - **fix**: Auto-suggest fixes:
     - Waits: Replace fixed waits with explicit waits, increase timeouts
     - Selectors: Add data-testid, use stable locators, avoid nth-child
     - Data: Isolate test data, use unique identifiers, cleanup
     - Async: Proper async/await, promise handling, race condition fixes
     - Environment: Mock external services, control test environment
     - Order: Ensure test independence, randomize order
   - **report**: Dashboard with trends, MTTR, cost (CI minutes, developer time)
5. Track:
   - Quarantine duration (auto-release after N passes)
   - Fix rate (PRs merged / quarantined)
   - Re-flake rate (fixed tests that become flaky again)
6. Output:
   - Flaky test registry (JSON, Excel)
   - Quarantine configuration (pytest, jest, playwright, cypress)
   - Fix PRs with confidence scores
   - Dashboard (HTML, Grafana)
7. Update shared context

## Shared Context Keys
- `sdet.flake.flaky[]` (testId, passRate, pattern, classification)
- `sdet.flake.quarantined[]` (testId, quarantineDate, reason)
- `sdet.flake.fix-suggestions[]` (testId, fixType, codeChange, confidence)
- `sdet.flake.metrics` (totalTests, flakyCount, quarantineCount, fixRate, reFlakeRate)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| window | number | false | 30 | History window (days) |
| action | string | false | all | Action (detect, quarantine, fix, report, all) |
| threshold | number | false | 0.05 | Flake rate threshold |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-flake '{"flaky":[],"quarantined":[],"fixSuggestions":[],"metrics":{}}'
```

## Output
- Flaky test registry
- Quarantine configuration
- Fix PRs with confidence scores
- Flakiness dashboard