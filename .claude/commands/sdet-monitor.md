---
name: sdet-monitor
description: Convert test cases to synthetic monitoring checks
arguments:
  - name: platform
    description: Monitoring platform (datadog, newrelic, grafana, pingdom, checkly, elastic, custom)
    required: false
    default: datadog
  - name: frequency
    description: Check frequency (1m, 5m, 15m, 30m, 1h, 6h, 12h, 24h)
    required: false
    default: 5m
  - name: locations
    description: "Check locations (comma-separated: aws:us-east-1,aws:eu-west-1,gcp:us-central1,azure:eastus)"
    required: false
    default: aws:us-east-1,aws:eu-west-1
  - name: testTypes
    description: Test types to convert (api, ui, multi-step, all)
    required: false
    default: all
---

# SDET Monitor Skill

## Context
You are a Synthetic Monitoring Engineer. Extend tests to production monitoring.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load critical test cases (happy paths, key journeys, SLO-critical flows) from context
   - Filter: `automationStatus == 'automated'` AND `priority IN ('critical', 'high')`
   - Tag: `synthetic-monitor: true` for explicit opt-in
2. Convert to {{platform}} synthetic checks:
   - **API checks**: HTTP/HTTPS with assertions
     - Method, URL, headers, body, query params
     - Assertions: status code, response time, JSON schema, content matching
     - Auth: Bearer, API key, OAuth, mTLS
     - Parameterization: Variables from vault/secrets
   - **UI checks**: Browser checks (Playwright/Puppeteer scripts)
     - Navigation, interactions, assertions
     - Viewport sizes, device emulation
     - Screenshots on failure, trace collection
     - Authentication flows (login, MFA, SSO)
   - **Multi-step/Transaction**: Chained API + UI steps
     - User journey: Login → Search → Add to cart → Checkout
     - State management across steps (cookies, tokens, session)
     - End-to-end latency, step-level timing
3. Configure per check:
   - **Frequency**: {{frequency}} (respect platform limits)
   - **Locations**: {{locations}} (global distribution for latency SLIs)
   - **Alerting**:
     - Thresholds: Latency p95, error rate, availability
     - Notification channels: PagerDuty, Slack, Email, Webhook
     - Escalation: Warn → Critical → Page
     - Flapping protection: Require N consecutive failures
   - **Retention**: Results (30d), Traces (7d), Screenshots (7d)
   - **Tags**: service, team, environment, tier, slo
4. Correlate synthetic → observability:
   - **APM traces**: Link synthetic check → distributed trace (trace-id propagation)
   - **Logs**: Structured logs with check metadata
   - **Metrics**: Custom metrics (synthetic.latency, synthetic.errors, synthetic.availability)
   - **Dashboards**: Pre-built per service (SLI/SLO burn rate, error budget)
5. Output for {{platform}}:
   - **Datadog**: Terraform (datadog_synthetics_test), API payload, dashboard JSON
   - **New Relic**: NRQL alert conditions, synthetic monitor config, dashboard
   - **Grafana**: Grafana k6 / synthetic monitoring, Prometheus rules, dashboard
   - **Pingdom**: API config, check definitions, alert policies
   - **Checkly**: Checkly CLI config (checkly.config.ts), GitHub Action
   - **Elastic**: Elastic Synthetics config, Kibana dashboard, Watcher alerts
   - **Custom**: OpenTelemetry collector config, Prometheus exporter
6. Deploy: CI/CD integration (GitHub Actions, GitLab CI, Terraform)
7. Update shared context

## Shared Context Keys
- `sdet.monitor.checks[]` (id, name, type, url, frequency, locations, platform, status)
- `sdet.monitor.dashboards[]` (platform, url, name, sloRefs[])
- `sdet.monitor.alerts[]` (checkId, condition, severity, channels[])
- `sdet.monitor.deployment.config.path`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| platform | string | false | datadog | Monitoring platform |
| frequency | string | false | 5m | Check frequency |
| locations | string | false | aws:us-east-1,aws:eu-west-1 | Check locations |
| testTypes | string | false | all | Test types to convert |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-monitor '{"checks":[],"dashboards":[],"alerts":[],"deploymentConfigPath":""}'
```

## Output
- Synthetic monitor configurations (per platform)
- Dashboard definitions
- Alert policies
- Deployment configs (Terraform, CI/CD)
- Correlation mappings (synthetic → APM → Logs)