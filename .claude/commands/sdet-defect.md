---
name: sdet-defect
description: End-to-end defect management (create, track, verify, close)
arguments:
  - name: system
    description: Defect system (jira, github, gitlab, azure, rally, custom)
    required: false
    default: jira
  - name: action
    description: Action (create, update, link, verify, close, bulk, report)
    required: false
    default: create
  - name: autoLink
    description: Auto-link to test cases and requirements
    required: false
    default: true
---

# SDET Defect Skill

## Context
You are a Defect Manager. Streamline defect lifecycle.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load failures, test cases, requirements from context:
   - `sdet.execution.results.path` (failed tests with error details)
   - `sdet.results.updatedExcel.path` (test cases with results)
   - `sdet.requirements.path` (requirements for traceability)
   - `sdet.trace.matrix.path` (requirement ↔ test case ↔ automation links)
2. For {{action}}:
   - **create**: Auto-create defects with full context:
     - Steps to reproduce (from test case)
     - Logs, screenshots, videos, traces
     - Environment, test data, configuration
     - Severity (based on requirement priority, user impact)
     - Component (from code ownership, stack trace)
     - Labels: test-type, requirement-id, automation-id
   - **update**: Sync status, assignee, priority from test results
     - Re-run failed test on fix branch → update defect
     - Auto-transition: In Progress → In Review → Done
   - **link**: Bidirectional traceability:
     - Test case ↔ Defect (many-to-many)
     - Defect ↔ Requirement (impact analysis)
     - Defect ↔ Code fix (PR/commit links)
   - **verify**: Re-run failed test on fix branch:
     - Auto-close on pass (with evidence)
     - Reopen on fail (with new evidence)
     - Regression check: run related tests
   - **close**: Bulk close verified defects:
     - Apply resolution codes (Fixed, Won't Fix, Duplicate, Cannot Reproduce)
     - Update test cases with defect resolution
   - **bulk**: Mass operations (reassign, reprioritize, relabel, change component)
   - **report**: Defect analytics:
     - Aging report (open by days)
     - Backlog trends (created vs resolved)
     - Leakage (production defects vs test coverage)
     - Recurrence (reopened defects)
     - MTTR by severity/component/team
3. Enrich:
   - Duplicate detection (semantic similarity + stack trace)
   - Similar defects (same component, same error pattern)
   - Fix suggestion (from similar historical fixes)
4. Workflow: Custom statuses, transitions, SLAs, escalations
5. Output:
   - Defect sync report (created, updated, linked, verified, closed)
   - Updated test cases with defect links
   - Defect analytics dashboard
6. Update shared context

## Shared Context Keys
- `sdet.defect.created[]` (defectId, testCaseId, requirementId, severity, url)
- `sdet.defect.updated[]` (defectId, field, oldValue, newValue)
- `sdet.defect.linked[]` (defectId, testCaseIds, requirementIds)
- `sdet.defect.verified[]` (defectId, testCaseId, passed, evidence)
- `sdet.defect.closed[]` (defectId, resolution, testCaseIds)
- `sdet.defect.report.path` (analytics report)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| system | string | false | jira | Defect system (jira, github, gitlab, azure, rally, custom) |
| action | string | false | create | Action (create, update, link, verify, close, bulk, report) |
| autoLink | boolean | false | true | Auto-link to test cases and requirements |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-defect '{"created":[],"updated":[],"linked":[],"verified":[],"closed":[],"reportPath":""}'
```

## Output
- Defect sync report
- Updated test cases with traceability
- Defect analytics dashboard