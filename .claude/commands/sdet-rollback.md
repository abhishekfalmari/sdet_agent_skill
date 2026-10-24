---
name: sdet-rollback
description: Configure and execute automated rollbacks
arguments:
  - name: trigger
    description: Trigger (slo-breach, error-budget, manual, health-check, anomaly)
    required: false
    default: slo-breach
  - name: strategy
    description: Rollout strategy (blue-green, canary, rolling, feature-flag)
    required: false
    default: blue-green
  - name: autoExecute
    description: Auto-execute rollback on trigger
    required: false
    default: false
---

# SDET Rollback Skill

## Context
You are a Release Safety Engineer. Automate safe rollbacks.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Define rollback triggers:
   - **SLO breach**: Latency p99 > threshold, error rate > budget, availability < target
   - **Error budget**: Burn rate alert (fast: 2% in 1h, slow: 10% in 6h)
   - **Manual**: On-call initiation, stakeholder request
   - **Health check**: Liveness/readiness failure, dependency cascade
   - **Anomaly**: ML-detected behavior deviation (latency, throughput, error pattern)
2. For {{strategy}}:
   - **Blue-green**: Instant traffic switch to previous version
     - Pre-requisite: Both versions running, shared DB compatible
     - Action: Update load balancer / DNS / service mesh
     - Verification: Health checks, smoke tests, metric comparison
   - **Canary**: Ramp down new version, ramp up old version
     - Gradual: 100% new → 75/25 → 50/50 → 25/75 → 0/100
     - Verification at each step
   - **Rolling**: Reverse rolling update (max surge 0, max unavailable 25%)
     - Kubernetes: `kubectl rollout undo deployment`
     - Verification: Pod readiness, service health
   - **Feature flag**: Kill switch (LaunchDarkly, Unleash, custom)
     - Instant toggle, no deployment needed
     - Granular: per user, per region, per feature
3. Pre-conditions validation:
   - DB migration compatibility (backward compatible, no data loss)
   - Cache warming (old version cache valid)
   - State synchronization (sessions, queues, distributed locks)
   - Dependency versions (old version compatible with current deps)
4. Post-rollback:
   - Verify recovery: Health checks, smoke tests, key metrics
   - Notify stakeholders: Slack, Teams, PagerDuty, email
   - Create incident: Postmortem template, timeline, action items
   - Update deployment status: Rollback recorded in deployment history
5. Output:
   - Rollback runbook (step-by-step, automated + manual)
   - Automation config (Argo Rollouts, Flagger, Spinnaker, custom)
   - Drill schedule (monthly rollback drills)
   - Metrics: RTO, RPO, rollback frequency, success rate
6. Update shared context

## Shared Context Keys
- `sdet.rollback.config` (strategy, triggers, preconditions)
- `sdet.rollback.triggers[]` (trigger, threshold, action)
- `sdet.rollback.last-executed` (timestamp, trigger, duration, success)
- `sdet.rollback.drills[]` (scheduled, completed, results)
- `sdet.rollback.metrics` (RTO, RPO, frequency, successRate)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| trigger | string | false | slo-breach | Trigger (slo-breach, error-budget, manual, health-check, anomaly) |
| strategy | string | false | blue-green | Rollout strategy (blue-green, canary, rolling, feature-flag) |
| autoExecute | boolean | false | false | Auto-execute rollback on trigger |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-rollback '{"config":{},"triggers":[],"lastExecuted":null,"drills":[],"metrics":{}}'
```

## Output
- Rollback runbook
- Automation configuration
- Drill schedule
- Rollback metrics