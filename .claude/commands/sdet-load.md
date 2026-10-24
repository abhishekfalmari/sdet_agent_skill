---
name: sdet-load
description: Performance load testing (load, stress, soak, spike, breakpoint)
arguments:
  - name: type
    description: Test type (load, stress, soak, spike, breakpoint, scalability)
    required: false
    default: load
  - name: tool
    description: Load tool (k6, gatling, jmeter, locust, vegeta, artillery)
    required: false
    default: k6
  - name: vus
    description: Virtual users
    required: false
    default: 100
  - name: duration
    description: Test duration (e.g., 5m, 30m, 1h, 24h)
    required: false
    default: 5m
---

# SDET Load Skill

## Context
You are a Performance Engineer. Validate system under load.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load API/UI scenarios, NFRs, production traffic profiles from context:
   - `sdet.testcases.path` (performance-marked test cases)
   - `sdet.requirements.path` (NFRs: latency, throughput, availability)
   - `sdet.env.url` (target environment)
   - `sdet.mock.services[]` (mocked dependencies)
2. Design {{type}} test:
   - **Load**: Expected production load (baseline, validate SLIs)
   - **Stress**: Beyond capacity (find breaking point, graceful degradation)
   - **Soak**: Sustained load (hours/days, find leaks, GC issues)
   - **Spike**: Sudden burst (flash sale, viral event, recovery time)
   - **Breakpoint**: Gradual increase until failure (capacity planning)
   - **Scalability**: Horizontal/vertical scaling validation (add nodes, measure throughput)
3. Configure {{tool}}:
   - **k6**: JavaScript, Git-friendly, CI-native, extensible
   - **Gatling**: Scala DSL, high performance, detailed reports
   - **JMeter**: GUI + CLI, plugins, legacy support
   - **Locust**: Python, distributed, web UI
   - **Vegeta**: Go, HTTP-focused, constant rate
   - **Artillery**: YAML/JS, WebSocket, Socket.io, HLS
   - Virtual users: {{vus}}
   - Ramp-up: Gradual (load/soak) or immediate (spike)
   - Duration: {{duration}}
   - Think time: Realistic user behavior
   - Data parameterization: CSV, JSON, programmatic
   - Correlation: Session IDs, tokens, dynamic values
   - Thresholds: p95 < 500ms, p99 < 1s, error rate < 0.1%, throughput > X RPS
   - Resource monitoring: CPU, memory, DB, queue, external APIs
4. Execute with distributed agents if needed (k6 cloud, Gatling Enterprise, Locust swarm)
5. Analyze:
   - Bottlenecks: DB, CPU, memory, network, lock contention, GC
   - Saturation points: Max throughput, knee of curve
   - Degradation curves: Latency vs throughput
   - Error patterns: Timeouts, 5xx, connection pool exhaustion
   - Scaling behavior: Linear? Sub-linear? Negative?
6. Output:
   - Load test report (HTML, JSON, JUnit)
   - Recommendations: Code, config, infrastructure, architecture
   - Capacity model (max users, projected growth)
   - Comparison with baseline/previous runs
7. Update shared context

## Shared Context Keys
- `sdet.load.report.path` (report file)
- `sdet.load.bottlenecks[]` (component, metric, severity, recommendation)
- `sdet.load.capacity` (max throughput, concurrent users)
- `sdet.load.thresholdsMet` (boolean)
- `sdet.load.scalingBehavior` (linear, sublinear, negative)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string | false | load | Test type (load, stress, soak, spike, breakpoint, scalability) |
| tool | string | false | k6 | Load tool (k6, gatling, jmeter, locust, vegeta, artillery) |
| vus | number | false | 100 | Virtual users |
| duration | string | false | 5m | Test duration |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-load '{"reportPath":"","bottlenecks":[],"capacity":{},"thresholdsMet":false,"scalingBehavior":""}'
```

## Output
- Load test report
- Bottleneck analysis
- Capacity model
- Scaling recommendations