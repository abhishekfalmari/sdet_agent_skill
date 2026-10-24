---
name: sdet-review
description: Manage test case peer review process
arguments:
  - name: mode
    description: Review mode (async, sync, gated, checklist)
    required: false
    default: async
  - name: reviewers
    description: Comma-separated reviewer IDs or 'auto'
    required: false
    default: auto
  - name: checklist
    description: Custom checklist file path
    required: false
---

# SDET Review Skill

## Context
You are a Review Coordinator. Ensure test quality through structured peer review.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load test cases from context (validated but not reviewed): `sdet.testcases.path`
2. Assign reviewers ({{reviewers}} or auto-assign by expertise tags)
3. Generate review checklist (use {{checklist}} or default):
   - **Requirements Coverage**: Every acceptance criterion has test cases
   - **Test Design Correctness**: Steps are clear, data is specific, expected results verifiable
   - **Data Adequacy**: Test data covers valid, invalid, boundary, edge cases
   - **Automation Feasibility**: Test cases marked for automation are automatable
   - **Maintainability**: No hardcoded values, reusable data, clear naming
   - **Security/Performance Considerations**: Non-functional aspects addressed
   - **Traceability**: Links to requirements, defects, automation IDs present
   - **Negative/Boundary Coverage**: Beyond happy path
4. For {{mode}}:
   - **async**: Create review tasks (GitHub PR, Jira, Azure DevOps), collect comments asynchronously
   - **sync**: Schedule review meeting, capture decisions in real-time
   - **gated**: Block promotion to automation until approval (CI gate)
   - **checklist**: Enforce checklist completion before sign-off
5. Track per review:
   - Comments (categorized: blocker, major, minor, suggestion)
   - Decisions (accept, reject, defer)
   - Approvals (reviewer, timestamp)
   - Rework cycles (max 3 before escalation)
6. Output:
   - Review report (summary + all comments + decisions)
   - Updated test cases with review status column
   - Metrics: Review velocity, defect detection rate, rework %
7. Update shared context

## Shared Context Keys
- `sdet.review.status` (pending, in-progress, approved, rejected)
- `sdet.review.comments[]` (per test case, per reviewer)
- `sdet.review.approved` (boolean)
- `sdet.review.reviewers[]`
- `sdet.review.metrics` (velocity, detection rate, rework %)
- `sdet.review.updatedTestcases.path`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| mode | string | false | async | Review mode (async, sync, gated, checklist) |
| reviewers | string | false | auto | Comma-separated reviewer IDs or 'auto' |
| checklist | string | false | | Custom checklist file path |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-review '{"status":"pending","comments":[],"approved":false,"reviewers":[],"metrics":{},"updatedTestcasesPath":""}'
```

## Output
- Review report (Markdown + JSON)
- Annotated test cases with review status
- Review metrics dashboard
- Action items for rework