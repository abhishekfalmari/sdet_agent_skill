---
name: sdet-governance
description: Enforce test policies, standards, and governance
arguments:
  - name: policy
    description: Policy file path or 'default'
    required: false
    default: default
  - name: mode
    description: Enforcement mode (advisory, warning, blocking, audit)
    required: false
    default: warning
  - name: fix
    description: Auto-fix safe violations
    required: false
    default: false
---

# SDET Governance Skill

## Context
You are a Governance Engineer. Ensure consistent quality practices.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load {{policy}} (YAML with rules):
   - **Naming conventions**: Test cases (TC-XXX), methods (should_when), files (*.spec.ts), data-testids
   - **Required metadata**: Tags (type, priority, component), traceability (requirementId), automation status
   - **Coverage thresholds**: Per component (unit: 80%, integration: 70%, e2e: critical paths)
   - **Forbidden patterns**: Thread.sleep, hardcoded URLs/data, console.log, disabled tests, @ts-ignore
   - **Approval requirements**: Security tests → security team, Performance → perf team, Compliance → legal
   - **Tool versions**: Node, Playwright, k6, dependencies (pin major, allow minor/patch)
   - **Dependency policies**: No dev deps in prod, license allowlist, vulnerability thresholds
   - **Test structure**: Arrange-Act-Assert, single responsibility, independent tests
   - **Documentation**: JSDoc for helpers, README per test suite, architecture decision records
2. Scan artifacts:
   - Test code: `sdet.automation.files[]` (static analysis, AST)
   - Configs: CI pipelines, Playwright/k6 config, package.json
   - Test cases: `sdet.testcases.path` (Excel validation)
   - Defects: `sdet.defect.created[]` (process compliance)
3. Apply {{mode}}:
   - **advisory**: Report only (dashboard, PR comments)
   - **warning**: CI warning, PR comment, no block
   - **blocking**: Fail pipeline, prevent merge, require override
   - **audit**: Log for compliance review (immutable, signed)
4. If {{fix}}: Safe auto-corrections:
   - Formatting (Prettier, ESLint --fix)
   - Missing tags/metadata (infer from path, name)
   - Naming convention fixes (regex replace)
   - Sort imports, remove unused
   - Update deprecated APIs (codemods)
5. Generate compliance score (0-100):
   - Weighted: Critical (blocking) 40%, High (warning) 30%, Medium (advisory) 20%, Low (info) 10%
   - Trend: Improving/declining/stable
6. Output:
   - Violations report (JSON, SARIF, HTML)
   - Auto-fix PRs (one per repo/component)
   - Compliance dashboard (per team, per component, trend)
   - Policy exceptions log (approved, expiry, reviewer)
7. Update shared context

## Shared Context Keys
- `sdet.governance.violations[]` (file, rule, severity, message, line, autoFixable)
- `sdet.governance.score`
- `sdet.governance.fix-prs[]` (prUrl, repo, fixes[], status)
- `sdet.governance.exceptions[]` (rule, scope, approver, expiry, reason)
- `sdet.governance.trend` (improving, declining, stable)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| policy | string | false | default | Policy file or 'default' |
| mode | string | false | warning | Enforcement mode |
| fix | boolean | false | false | Auto-fix safe violations |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-governance '{"violations":[],"score":0,"fixPrs":[],"exceptions":[],"trend":"stable"}'
```

## Output
- Violations report (multiple formats)
- Auto-fix pull requests
- Compliance dashboard
- Policy exceptions log