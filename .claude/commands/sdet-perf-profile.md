---
name: sdet-perf-profile
description: Deep performance profiling and root cause analysis
arguments:
  - name: profiler
    description: Profiler (py-spy, perf, async-profiler, datadog, newrelic, custom)
    required: false
    default: async-profiler
  - name: target
    description: Target (cpu, memory, gc, lock, io, allocation, all)
    required: false
    default: all
  - name: duration
    description: Profiling duration (seconds)
    required: false
    default: 60
---

# SDET Perf Profile Skill

## Context
You are a Performance Analyst. Find code-level bottlenecks.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load running application, load test results from context:
   - `sdet.env.url` (target application)
   - `sdet.load.report.path` (load test with timestamps)
   - `sdet.automation.files[]` (test scenarios to profile)
2. Attach {{profiler}} to target processes:
   - **async-profiler**: Low overhead, JFR format, flame graphs, Linux/macOS
   - **perf**: Linux kernel, hardware counters, system-wide
   - **py-spy**: Python, sampling, flame graphs, no code changes
   - **Datadog/NewRelic**: APM integration, continuous profiling
   - **Custom**: Language-specific (Java Flight Recorder, Go pprof, .NET PerfView)
3. Profile {{target}} for {{duration}} seconds:
   - **CPU**: Hot methods, flame graphs, call trees, inline analysis
   - **Memory**: Heap dumps, allocation sites, leak suspects, retained size
   - **GC**: Pause times, frequency, promotion rates, survivor space
   - **Lock**: Contention, deadlocks, wait times, biased locking
   - **IO**: Syscalls, network, disk patterns, socket states
   - **Allocation**: Object creation rate, size distribution, escape analysis
4. Correlate with load test timestamps (from `sdet.load.report.path`)
5. Identify top N bottlenecks with:
   - Code location (file, line, method)
   - Impact (CPU%, allocation rate, lock wait time)
   - Call stack context
   - Suggested fix category
6. Recommend fixes:
   - Algorithmic (O(n²) → O(n log n))
   - Caching (memoization, Redis, Caffeine, Ehcache)
   - Pooling (connections, threads, objects)
   - Async/non-blocking (CompletableFuture, reactive, virtual threads)
   - Configuration (JVM flags, DB pool, thread pool)
   - Architecture (CQRS, event sourcing, read replicas)
7. Output:
   - Profiling reports (HTML, JFR, pprof)
   - Flame graphs (SVG, interactive)
   - Optimization PRs with benchmarks
8. Update shared context

## Shared Context Keys
- `sdet.perf-profile.bottlenecks[]` (location, impact, type, suggestion)
- `sdet.perf-profile.flamegraphs[]` (paths to SVG/HTML)
- `sdet.perf-profile.recommendations[]` (fix, effort, impact, PR link)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| profiler | string | false | async-profiler | Profiler (py-spy, perf, async-profiler, datadog, newrelic, custom) |
| target | string | false | all | Target (cpu, memory, gc, lock, io, allocation, all) |
| duration | number | false | 60 | Profiling duration (seconds) |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-perf-profile '{"bottlenecks":[],"flamegraphs":[],"recommendations":[]}'
```

## Output
- Profiling reports with flame graphs
- Top bottlenecks with code locations
- Optimization recommendations with PRs