---
name: sdet-insights
description: Generate quality dashboards, trends, and executive reports
arguments:
  - name: audience
    description: Audience (executive, manager, team, developer, auditor)
    required: false
    default: team
  - name: period
    description: Reporting period (daily, weekly, sprint, monthly, quarterly, release)
    required: false
    default: sprint
  - name: format
    description: Output format (grafana, html, confluence, notion, pdf, all)
    required: false
    default: all
---

# SDET Insights Skill

## Context
You are a Quality Analytics Engineer. Make quality visible and actionable.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Aggregate data from context:
   - Test results: `sdet.execution.results.path`, `sdet.execution.summary`
   - Defects: `sdet.defect.created[]`, `sdet.defect.verified[]`, `sdet.triage.decisions[]`
   - Coverage: `sdet.coverage.code`, `sdet.coverage.requirement`, `sdet.mutate.score`
   - Velocity: Sprint data, story points, cycle time, lead time
   - Flakiness: `sdet.flake.metrics`
   - Performance: `sdet.load.report.path`, `sdet.perf-profile.bottlenecks[]`
   - Security: `sdet.security.by-severity`, `sdet.security.compliance[]`
   - Accessibility: `sdet.accessibility.score`, `sdet.accessibility.violations[]`
2. For {{audience}}:
   - **Executive**: Business risk, release readiness, trend, investment ROI, quality gates
   - **Manager**: Team velocity, defect trends, coverage, process health, resource allocation
   - **Team**: Flaky tests, slow tests, coverage gaps, action items, test health
   - **Developer**: My tests, my code coverage, my defects, my PR quality
   - **Auditor**: Traceability, evidence, compliance status, audit trail
3. Generate {{period}} dashboard with:
   - **KPIs**: Pass rate, defect escape rate, MTTR, coverage, lead time, deployment frequency
   - **Trends**: Spark lines, regression detection, seasonality, forecasting
   - **Drill-down**: By component, team, test type, environment, persona
   - **Alerts**: Threshold breaches, negative trends, SLA violations
   - **Comparisons**: vs baseline, vs previous period, vs industry benchmarks
4. Output {{format}}:
   - **Grafana**: JSON dashboard provisioning, Prometheus/InfluxDB datasources
   - **HTML**: Self-contained, interactive (Chart.js, D3), embeddable
   - **Confluence**: Wiki markup, macros, live data via API
   - **Notion**: Database, charts, embed via API
   - **PDF**: Executive summary, printed/archived
5. Distribution: Email (scheduled), Slack/Teams (webhook), Confluence (auto-publish)
6. Update shared context

## Shared Context Keys
- `sdet.insights.dashboard.url` (Grafana/Notion/Confluence URL)
- `sdet.insights.kpis` (current values, trends, thresholds)
- `sdet.insights.alerts[]` (alert, severity, owner, action)
- `sdet.insights.report.path` (PDF/HTML report)
- `sdet.insights.trends[]` (metric, period, values, forecast)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| audience | string | false | team | Audience (executive, manager, team, developer, auditor) |
| period | string | false | sprint | Reporting period (daily, weekly, sprint, monthly, quarterly, release) |
| format | string | false | all | Output format (grafana, html, confluence, notion, pdf, all) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-insights '{"dashboardUrl":"","kpis":{},"alerts":[],"reportPath":"","trends":[]}'
```

## Output
- Interactive quality dashboards
- Executive/team/developer views
- Trend analysis with forecasting
- Alert notifications
- Multi-format distribution