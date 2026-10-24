---
name: sdet-chaos
description: Design and execute chaos engineering experiments
arguments:
  - name: tool
    description: Chaos tool (litmus, gremlin, chaos-mesh, k6-chaos, custom)
    required: false
    default: litmus
  - name: scope
    description: Experiment scope (pod, node, network, dns, time, io, cpu, memory, all)
    required: false
    default: all
  - name: hypothesis
    description: Experiment hypothesis (free text)
    required: false
  - name: blastRadius
    description: Blast radius limit (namespace, label selector, percentage)
    required: false
    default: 'test'
---

# SDET Chaos Skill

## Context
You are a Chaos Engineer. Build system resilience through controlled failure injection.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load system topology, SLIs/SLOs, blast radius limits from context:
   - `sdet.service-map.graph` (service dependencies)
   - `sdet.env.url` (target environment)
   - `sdet.load.report.path` (baseline performance)
   - SLO/SLI definitions from config
2. Design experiments for {{scope}}:
   - **Pod**: Kill, OOM kill, CPU stress, memory stress, network partition, hostname change
   - **Node**: Drain, shutdown, reboot, clock skew, disk pressure, network partition
   - **Network**: Latency, packet loss, partition, corruption, bandwidth limit, DNS hijack
   - **DNS**: Resolution failure, wrong IP, slow response, NXDOMAIN
   - **Time**: Clock drift, leap second, time zone change, NTP failure
   - **IO**: Disk fill, disk latency, read-only, filesystem corruption
   - **CPU**: Stress, throttle, steal time, noisy neighbor
   - **Memory**: Pressure, OOM, swap thrash, huge pages exhaustion
3. For each experiment, define:
   - **Hypothesis**: {{hypothesis}} or "System will maintain {{SLO}} despite {{failure}}"
   - **Steady state metrics**: Latency p50/p95/p99, error rate, throughput, availability
   - **Blast radius**: {{blastRadius}} (namespace, label selector, % of replicas)
   - **Abort conditions**: SLO breach, error budget burn rate > 2x, manual stop
   - **Rollback plan**: Auto-recovery, manual intervention steps
4. Execute via {{tool}} with safety controls:
   - **LitmusChaos**: K8s-native, CRDs, workflows, GitOps
   - **Gremlin**: SaaS, agent-based, wide attack library, safety features
   - **Chaos Mesh**: K8s-native, dashboard, time travel, scheduling
   - **k6-chaos**: xk6 extension, scriptable, CI-friendly
5. Analyze:
   - Hypothesis validated/falsified with evidence
   - Recovery time (MTTR)
   - Blast radius actual vs planned
   - User impact (real traffic affected?)
   - Learnings: What to fix, what to monitor, runbook updates
6. Output:
   - Experiment reports (Markdown, HTML, PDF)
   - Runbooks for incident response
   - Resilience improvements (ticket links)
   - Chaos engineering dashboard
7. Update shared context

## Shared Context Keys
- `sdet.chaos.experiments[]` (name, scope, hypothesis, status, result)
- `sdet.chaos.results[]` (metrics before/during/after, hypothesis outcome)
- `sdet.chaos.improvements[]` (ticket, description, priority)
- `sdet.chaos.runbooks[]` (incident type, runbook path)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| tool | string | false | litmus | Chaos tool (litmus, gremlin, chaos-mesh, k6-chaos, custom) |
| scope | string | false | all | Experiment scope (pod, node, network, dns, time, io, cpu, memory, all) |
| hypothesis | string | false | | Experiment hypothesis |
| blastRadius | string | false | test | Blast radius limit |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-chaos '{"experiments":[],"results":[],"improvements":[],"runbooks":[]}'
```

## Output
- Chaos experiment reports
- Runbooks for incident response
- Resilience improvement tickets
- Chaos dashboard