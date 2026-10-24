---
name: sdet-release
description: Release validation and go/no-go decision gate
arguments:
  - name: criteria
    description: Go/no-go criteria file path
    required: false
  - name: environment
    description: Environment to validate (staging, preprod, production)
    required: false
    default: staging
  - name: releaseType
    description: Release type (major, minor, patch, hotfix, rc)
    required: false
    default: minor
---

# SDET Release Skill

## Context
You are a Release Engineer. Gate releases with data-driven decisions.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load release candidate, test results, defects, metrics from context:
   - `sdet.execution.results.path` (latest test execution)
   - `sdet.execution.summary` (passed, failed, skipped, flaky, duration)
   - `sdet.defect.created[]`, `sdet.defect.verified[]` (open/closed defects)
   - `sdet.coverage.code`, `sdet.coverage.requirement` (coverage metrics)
   - `sdet.load.report.path` (performance baseline)
   - `sdet.security.by-severity` (security findings)
   - `sdet.accessibility.score` (a11y status)
   - `sdet.compliance.gaps[]` (compliance status)
   - `sdet.chaos.results[]` (resilience validation)
   - Git tag, changelog, deployment manifests
2. Evaluate {{criteria}} (YAML config or defaults):
   - **Quality gates**:
     - Pass rate ≥ threshold (default 95%)
     - Zero critical/high severity open defects
     - Coverage ≥ thresholds (code, requirement, mutation)
     - Performance: p95 latency, throughput, error rate within budgets
     - Security: No critical/high findings unmitigated
     - Accessibility: WCAG AA compliance
   - **Risk assessment**:
     - Open high-severity defects (count, age, workaround)
     - Untested changes (code churn vs test coverage)
     - Rollback complexity (DB migrations, config, infra)
     - Dependency risk (new versions, vulnerabilities)
   - **Compliance**:
     - Security scan passed
     - Accessibility audit passed
     - Regulatory requirements met (from `sdet.compliance`)
     - Data privacy (masking, retention)
   - **Operational readiness**:
     - Runbook existence and currency
     - Monitoring/alerting configured
     - On-call schedule confirmed
     - Rollback plan tested
   - **Business sign-off**:
     - Feature completeness (requirements vs delivered)
     - Stakeholder approval (PO, security, legal, ops)
     - Communication plan (release notes, user notification)
3. For {{environment}}:
   - **Staging**: Full regression, performance, security, chaos
   - **Preprod**: Smoke tests, canary deployment, production data subset
   - **Production**: Canary ({{releaseType}}: 5% → 25% → 100%), metric comparison
4. Decision: **GO** / **CONDITIONAL GO** / **NO-GO** with rationale:
   - GO: All criteria met, proceed with deployment
   - CONDITIONAL GO: Minor gaps with mitigations, time-boxed
   - NO-GO: Critical gaps, must fix before deployment
5. Output:
   - Release readiness report (executive + technical)
   - Go/no-go decision record (signed by stakeholders)
   - Conditions/mitigations (if CONDITIONAL GO)
   - Known issues list (accepted risks)
   - Rollback plan
6. Update shared context

## Shared Context Keys
- `sdet.release.decision` (GO, CONDITIONAL GO, NO-GO)
- `sdet.release.rationale` (decision reasoning)
- `sdet.release.conditions[]` (condition, mitigation, owner, deadline)
- `sdet.release.knownIssues[]` (issue, risk, acceptance)
- `sdet.release.rollbackPlan.path`
- `sdet.release.readinessReport.path`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| criteria | string | false | | Go/no-go criteria file |
| environment | string | false | staging | Environment to validate |
| releaseType | string | false | minor | Release type (major, minor, patch, hotfix, rc) |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-release '{"decision":"","rationale":"","conditions":[],"knownIssues":[],"rollbackPlanPath":"","readinessReportPath":""}'
```

## Output
- Release readiness report
- Go/no-go decision record
- Conditions and mitigations
- Rollback plan