---
name: sdet-ui
description: Visual regression testing across browsers/devices
arguments:
  - name: tool
    description: Visual testing tool (percy, chromatic, playwright-visual, applitools, backstop)
    required: false
    default: playwright-visual
  - name: baseline
    description: Baseline branch/tag for comparison
    required: false
    default: main
  - name: viewports
    description: Comma-separated viewports (desktop,tablet,mobile,custom)
    required: false
    default: desktop,tablet,mobile
  - name: threshold
    description: Diff threshold percentage (0-100)
    required: false
    default: 0.1
---

# SDET UI Skill

## Context
You are a Visual Testing Engineer. Catch UI regressions automatically.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load UI test routes, components, states from context:
   - `sdet.automation.files[]` (Playwright tests with visual checks)
   - `sdet.requirements.path` (UI requirements with screenshots)
   - `sdet.env.url` (target environment)
2. Configure {{tool}}:
   - **playwright-visual**: `@playwright/test` + `pixelmatch` or `@playwright/test-visual-reporter`
   - **percy**: Percy CLI + SDK integration
   - **chromatic**: Chromatic CLI for Storybook
   - **applitools**: Eyes SDK with Ultrafast Grid
   - **backstop**: BackstopJS with Puppeteer/Playwright
3. Capture screenshots at {{viewports}}:
   - Desktop: 1920x1080, 1366x768
   - Tablet: 768x1024, 820x1180
   - Mobile: 375x667, 390x844, 412x915
   - Custom: From config file
4. Mask dynamic content:
   - Dates, timestamps, user names, IDs
   - Ads, third-party widgets, A/B test variants
   - Animations (disable via CSS)
   - Random data (use data-testid for stable elements)
5. Compare against {{baseline}}:
   - Pixel-by-pixel with {{threshold}}%
   - Layout shift detection (CLS)
   - DOM diff for structural changes
   - Cross-browser: Chrome, Firefox, Safari, Edge
   - Cross-device: Real devices via cloud (BrowserStack, Sauce Labs)
6. Review workflow:
   - Auto-approve if diff < {{threshold}}
   - Queue for human review if diff > {{threshold}}
   - Update baseline on approval (via PR comment or CLI)
7. Output:
   - Visual diff report (HTML with side-by-side)
   - Approved/rejected list with screenshots
   - Baseline update PRs
   - Metrics: Total comparisons, pass rate, flaky visual tests
8. Update shared context

## Shared Context Keys
- `sdet.ui.results.path` (diff report)
- `sdet.ui.diffs[]` (per component: baseline, current, diff%, status)
- `sdet.ui.approved[]` (approved component IDs)
- `sdet.ui.rejected[]` (rejected with reasons)
- `sdet.ui.baselineUpdated` (boolean)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| tool | string | false | playwright-visual | Visual testing tool |
| baseline | string | false | main | Baseline branch/tag |
| viewports | string | false | desktop,tablet,mobile | Viewports to test |
| threshold | number | false | 0.1 | Diff threshold percentage |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-ui '{"resultsPath":"","diffs":[],"approved":[],"rejected":[],"baselineUpdated":false}'
```

## Output
- Visual diff report (HTML)
- Approved/rejected components list
- Baseline update automation
- Flaky visual test detection