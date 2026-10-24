---
name: sdet-rootcause
description: Automated root cause analysis from test failures
arguments:
  - name: source
    description: Data source (logs, traces, metrics, screenshots, all)
    required: false
    default: all
  - name: depth
    description: Analysis depth (symptom, contributing, root, systemic)
    required: false
    default: root
  - name: timeWindow
    description: Time window before failure (minutes)
    required: false
    default: 30
---

# SDET Rootcause Skill

## Context
You are an RCA Engineer. Find true root causes automatically.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load failure: Error, stack trace, logs, traces, metrics, screenshots from:
   - `sdet.execution.results.path` (test failure details)
   - `sdet.env.url` (target environment for log/trace access)
   - Observability stack (Datadog, New Relic, Grafana, Elastic, Splunk, CloudWatch)
   - CI/CD logs (GitHub Actions, Jenkins, GitLab, Azure)
2. Correlate {{source}} for {{timeWindow}} minutes before failure:
   - **Logs**: Error patterns, exception chains, correlated events (Logstash, Loki, CloudWatch)
     - NLP: Cluster similar errors, extract entities (service, endpoint, user)
     - Anomaly: Unseen error types, frequency spikes
   - **Traces**: Distributed trace analysis (Jaeger, Zipkin, Tempo, X-Ray)
     - Latency: Slow spans, bottleneck services
     - Errors: Failed spans, error propagation
     - Dependencies: Upstream/downstream impact
   - **Metrics**: Anomaly detection (Prometheus, Datadog, CloudWatch)
     - CPU, memory, disk, network saturation
     - Queue depth, thread pool exhaustion
     - DB: Connections, slow queries, locks
     - External: API latency, error rate, circuit breaker
   - **Screenshots**: Visual diff at failure point (from `sdet.ui.results.path`)
     - Element not found, wrong state, layout shift
   - **Code**: Recent changes in call stack (git blame, PR links)
     - Deployments, config changes, feature flags
3. Apply {{depth}} analysis:
   - **Symptom**: What failed (assertion, exception, timeout)
   - **Contributing**: Environmental factors (deploy, config, data, infra)
   - **Root**: Code defect, infrastructure, dependency, design flaw
   - **Systemic**: Process gap, missing test, architecture issue, tech debt
4. ML: Use root-cause.onnx for pattern matching
   - Train on historical RCA data
   - Similarity search for known failure patterns
5. Output:
   - RCA report with evidence (logs, traces, metrics, screenshots, code)
   - 5 Whys analysis (automated)
   - Fix recommendation (code change, config, infra, process)
   - Prevention: Test to add, monitor to create, process to improve
   - Related failures (clustering)
6. Update shared context

## Shared Context Keys
- `sdet.rootcause.report.path` (RCA report)
- `sdet.rootcause.cause` (root cause summary)
- `sdet.rootcause.five-whys[]` (why chain)
- `sdet.rootcause.fix[]` (recommended fixes with priority)
- `sdet.rootcause.prevention[]` (tests, monitors, process changes)
- `sdet.rootcause.related[]` (similar failure IDs)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| source | string | false | all | Data source (logs, traces, metrics, screenshots, all) |
| depth | string | false | root | Analysis depth (symptom, contributing, root, systemic) |
| timeWindow | number | false | 30 | Time window before failure (minutes) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-rootcause '{"reportPath":"","cause":"","fiveWhys":[],"fix":[],"prevention":[],"related":[]}'
```

## Output
- RCA report with evidence
- 5 Whys analysis
- Fix recommendations
- Prevention measures