---
name: sdet-dashboard
description: Generate living documentation from tests
arguments:
  - name: format
    description: Output format (html, confluence, notion, gitbook, markdown, allure, all)
    required: false
    default: html
  - name: include
    description: Sections (requirements, tests, results, coverage, defects, architecture, all)
    required: false
    default: all
  - name: deploy
    description: Auto-deploy to platform (github-pages, confluence, notion, gitbook, s3, none)
    required: false
    default: none
---

# SDET Dashboard Skill

## Context
You are a Documentation Engineer. Keep docs in sync with tests.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load all artifacts from context:
   - Requirements: `sdet.requirements.path`, `sdet.traceability.path`
   - Test cases: `sdet.testcases.path`, `sdet.validation.status`
   - Automation: `sdet.automation.files[]`, `sdet.automation.types[]`
   - Results: `sdet.execution.results.path`, `sdet.execution.summary`
   - Coverage: `sdet.coverage.code`, `sdet.coverage.requirement`, `sdet.coverage.gaps[]`
   - Defects: `sdet.defect.created[]`, `sdet.defect.report.path`
   - Service map: `sdet.service-map.graph`, `sdet.service-map.visualization.path`
2. Generate {{format}} documentation with {{include}} sections:
   - **Requirements**: Specifications, acceptance criteria, priority, tags, traceability links
   - **Tests**: Test cases by type, automation status, priority, requirement coverage
   - **Results**: Latest execution summary, trends, pass/fail rates, flaky tests
   - **Coverage**: Code coverage (line, branch, function), requirement coverage, risk coverage, gaps
   - **Defects**: Open defects by severity, aging, leakage, MTTR trends
   - **Architecture**: Service topology, data flows, API contracts, test impact matrix
3. Features:
   - Live execution status badges (shields.io or custom)
   - Traceability links (click → test code, defect, requirement)
   - Search, filter, export (PDF, CSV, JSON)
   - Versioned per release (git tag based)
   - Dark/light theme, responsive design
   - Accessibility (WCAG AA)
4. Templates per format:
   - **HTML**: Static site (VitePress, Docusaurus, or custom), deploy to {{deploy}}
   - **Confluence**: Wiki markup / REST API, space/page hierarchy
   - **Notion**: API blocks, databases for test cases/defects
   - **GitBook**: Markbook config, GitHub sync
   - **Markdown**: GitHub Pages ready, mkdocs.yml
   - **Allure**: allure-results → allure-report, history trend
5. Deploy: {{deploy}} target with CI/CD integration
6. Update shared context

## Shared Context Keys
- `sdet.dashboard.url`
- `sdet.dashboard.version`
- `sdet.dashboard.sections[]`
- `sdet.dashboard.deploy.target`
- `sdet.dashboard.deploy.status`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| format | string | false | html | Output format |
| include | string | false | all | Sections to include |
| deploy | string | false | none | Auto-deploy target |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-dashboard '{"url":"","version":"","sections":[],"deployTarget":"","deployStatus":""}'
```

## Output
- Living documentation site (multi-format)
- Traceability navigation
- Deployment configuration
- Versioned releases