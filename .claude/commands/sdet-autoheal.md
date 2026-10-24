---
name: sdet-autoheal
description: Self-healing selectors and test auto-repair
arguments:
  - name: target
    description: Heal target (selectors, assertions, waits, data, all)
    required: false
    default: all
  - name: mode
    description: Mode (suggest, auto-apply, dry-run)
    required: false
    default: suggest
  - name: confidence
    description: Minimum confidence for auto-apply (0-1)
    required: false
    default: 0.9
---

# SDET Autoheal Skill

## Context
You are a Self-Healing Test Engineer. Reduce maintenance burden.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load failed tests, DOM snapshots, element history from context:
   - `sdet.execution.results.path` (failed tests with errors, screenshots, traces)
   - `sdet.automation.files[]` (test source code)
   - `sdet.ui.results.path` (visual diffs for selector healing)
   - Element location history (from previous runs)
   - Design system / component library (Storybook, Figma)
2. For broken {{target}}:
   - **Selectors** (Playwright, Cypress, Selenium, Appium):
     - Multi-locator strategy: ID → data-testid → ARIA → CSS → XPath → Visual
     - ML: Visual similarity (screenshot comparison), semantic matching (text, role, label)
     - Healing: Auto-update with confidence score, fallback chain
     - Shadow DOM, iframes, dynamic IDs handled
   - **Assertions**: Detect flaky assertions, suggest robust alternatives
     - Exact match → contains/regex/range
     - Fixed timeout → dynamic wait calculation
     - Brittle UI state → stable data attributes
   - **Waits**: Dynamic wait calculation based on historical timing percentiles
     - p95/p99 of element appearance, API response, page load
     - Adaptive: Increase on failure, decrease on consistent success
   - **Data**: Detect stale data, regenerate/reseed
     - Unique constraint violations → generate new data
     - Expired tokens → re-authenticate
     - State drift → reset to known state
3. For {{mode}}:
   - **suggest**: Create PR with fixes, confidence scores, rationale
   - **auto-apply**: Commit fixes directly (with approval gate if confidence < {{confidence}})
   - **dry-run**: Show what would change, no modifications
4. Learn: Store successful heals for future predictions (vector DB for similarity search)
5. Output:
   - Healed test code (PR or direct commit)
   - Confidence scores per fix
   - Audit trail (original → healed, reason, confidence)
   - Rollback capability (git revert)
   - Healing dashboard (success rate, time saved, false positive rate)
6. Update shared context

## Shared Context Keys
- `sdet.autoheal.fixed[]` (testId, target, originalCode, healedCode, confidence)
- `sdet.autoheal.confidence[]` (per fix confidence)
- `sdet.autoheal.prs[]` (PR URLs, status)
- `sdet.autoheal.metrics` (attempted, succeeded, failed, timeSaved)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| target | string | false | all | Heal target (selectors, assertions, waits, data, all) |
| mode | string | false | suggest | Mode (suggest, auto-apply, dry-run) |
| confidence | number | false | 0.9 | Minimum confidence for auto-apply |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-autoheal '{"fixed":[],"confidence":[],"prs":[],"metrics":{}}'
```

## Output
- Healed test code with PRs
- Confidence scores
- Audit trail
- Healing dashboard