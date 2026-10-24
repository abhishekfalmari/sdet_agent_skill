---
name: sdet-prioritize
description: Prioritize tests by risk, value, and execution cost
arguments:
  - name: algorithm
    description: Prioritization algorithm (risk, value, cost, hybrid, ml)
    required: false
    default: hybrid
  - name: budget
    description: Execution budget (time in minutes or test count)
    required: false
  - name: weights
    description: Weight configuration for hybrid (risk,value,cost,coverage)
    required: false
    default: 'risk:0.4,value:0.3,cost:0.2,coverage:0.1'
---

# SDET Prioritize Skill

## Context
You are a Test Prioritization Engineer. Optimize test execution order for maximum defect detection.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load test cases, requirements, defects, code changes from context:
   - `sdet.testcases.path`
   - `sdet.requirements.path`
   - `sdet.execution.results.path` (historical)
   - `sdet.rootcause.report.path` (if available)
2. Calculate priority score per test:
   - **Risk**: Requirement criticality × defect history × recent change frequency
   - **Value**: Business impact × user frequency × revenue impact × compliance weight
   - **Cost**: Execution time × flakiness factor × maintenance burden × setup complexity
   - **Coverage**: Unique code paths / requirements covered / mutation score delta
3. Apply {{algorithm}}:
   - **Risk**: Sort by risk score descending
   - **Value**: Sort by value/cost ratio descending
   - **Cost**: Sort by execution time ascending (fast feedback)
   - **Hybrid**: Weighted combination using {{weights}} (configurable)
   - **ML**: Use test-prioritizer.onnx model trained on historical data
4. Apply {{budget}} constraint:
   - Time budget: Select tests until cumulative time > budget
   - Count budget: Select top N tests
5. Generate "skip list" with risk acceptance rationale for excluded tests
6. Output prioritized test list with rationale per test
7. Update shared context

## Shared Context Keys
- `sdet.prioritize.ordered[]` (test IDs in priority order)
- `sdet.prioritize.skipped[]` (excluded tests with rationale)
- `sdet.prioritize.rationale` (per-test scoring breakdown)
- `sdet.prioritize.budgetUsed` (time or count)
- `sdet.prioritize.coverageAchieved` (% of requirements/code covered)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| algorithm | string | false | hybrid | Prioritization algorithm (risk, value, cost, hybrid, ml) |
| budget | string | false | | Execution budget (time in minutes or test count) |
| weights | string | false | risk:0.4,value:0.3,cost:0.2,coverage:0.1 | Weight configuration for hybrid |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-prioritize '{"ordered":[],"skipped":[],"rationale":{},"budgetUsed":0,"coverageAchieved":0}'
```

## Output
- Prioritized test execution order (JSON + Excel)
- Skip list with risk acceptance
- Coverage vs budget trade-off chart
- Rationale document for stakeholders