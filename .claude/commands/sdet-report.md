---
name: sdet-report
description: Generate executive and technical test reports
arguments:
  - name: type
    description: Report type (executive, technical, release, sprint, incident, compliance, custom)
    required: false
    default: executive
  - name: format
    description: Format (pdf, html, pptx, docx, markdown, confluence, notion, all)
    required: false
    default: pdf
  - name: period
    description: Reporting period (daily, weekly, sprint, monthly, quarterly, release, custom)
    required: false
    default: sprint
  - name: template
    description: Custom template path
    required: false
---

# SDET Report Skill

## Context
You are a Report Writer. Communicate quality status effectively.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load relevant data for {{type}} and {{period}} from context:
   - **Executive**: `sdet.insights.kpis`, `sdet.release.decision`, `sdet.retro.metrics`, `sdet.audit.checklist`, business risk, release readiness
   - **Technical**: `sdet.execution.summary`, `sdet.results.defects[]`, `sdet.rootcause.report.path`, `sdet.flake.flaky[]`, `sdet.coverage.gaps[]`
   - **Release**: `sdet.release.decision`, `sdet.release.rationale`, `sdet.release.conditions[]`, `sdet.release.knownIssues[]`, `sdet.rollback.config`
   - **Sprint**: `sdet.retro.findings[]`, `sdet.retro.actions[]`, velocity, quality metrics, carryover
   - **Incident**: `sdet.rootcause.report.path`, timeline, impact, root cause, prevention
   - **Compliance**: `sdet.compliance.report.path`, `sdet.compliance.gaps[]`, `sdet.audit.controls[]`
2. Generate {{format}} report with {{template}} or built-in templates:
   - **Executive** (1-2 pages):
     - Business risk score (Red/Amber/Green)
     - Release readiness (GO/CONDITIONAL/NO-GO)
     - Key trends (pass rate, defect escape, coverage)
     - Decisions needed (budget, headcount, scope, timeline)
     - Investment ROI (automation coverage, defect prevention)
   - **Technical** (detailed):
     - Test execution summary (by type, environment, browser)
     - Failure analysis (top failures, root causes, recurrence)
     - Flaky test registry (quarantined, fixed, new)
     - Coverage gaps (code, requirement, risk) with remediation
     - Performance benchmarks (baseline, current, regression)
     - Security findings (by severity, SLA, remediation)
   - **Release** (go/no-go package):
     - Decision record with signatures
     - Quality gate results (pass/fail per gate)
     - Known issues (accepted risks, mitigations)
     - Rollback plan (RTO, RPO, drill results)
     - Stakeholder sign-off
   - **Sprint** (retrospective + forward):
     - Quality metrics vs targets
     - Action items (previous sprint done, new)
     - Team health (workload, skill gaps, morale)
     - Next sprint focus areas
   - **Incident** (postmortem):
     - Timeline (detection → resolution)
     - Impact (users, revenue, SLA)
     - Root cause (5 Whys, contributing factors)
     - Prevention (test gaps, process, architecture)
     - Action items with owners/dates
   - **Compliance** (audit-ready):
     - Control status (compliant, gap, remediation)
     - Evidence references
     - Exception log
     - Next audit preparation
3. Include standard sections:
   - Executive summary (1 paragraph per audience)
   - Visualizations (charts, sparklines, heatmaps)
   - Drill-down links (test case, defect, code, trace)
   - Appendices (raw data, methodology, glossary)
4. Branding: Org logo, colors, templates (from {{template}} or defaults)
5. Distribution:
   - Email (HTML + PDF attachment)
   - Confluence (page update/create)
   - SharePoint (document library)
   - Slack/Teams (summary + link)
   - Notion (database entry)
6. Update shared context

## Shared Context Keys
- `sdet.report.path`
- `sdet.report.type`
- `sdet.report.period`
- `sdet.report.recipients[]`
- `sdet.report.distribution.status`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string | false | executive | Report type |
| format | string | false | pdf | Output format |
| period | string | false | sprint | Reporting period |
| template | string | false | | Custom template path |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-report '{"path":"","type":"","period":"","recipients":[],"distributionStatus":""}'
```

## Output
- Multi-format reports (PDF, HTML, PPTX, etc.)
- Executive summaries
- Technical deep-dives
- Distribution to stakeholders