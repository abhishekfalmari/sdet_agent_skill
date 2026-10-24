---
name: sdet-coverage
description: Analyze test coverage across code, requirements, risks
arguments:
  - name: type
    description: Coverage type (code, requirement, risk, branch, path, mutation, all)
    required: false
    default: all
  - name: threshold
    description: Minimum coverage thresholds (code,branch,requirement,risk,mutation)
    required: false
    default: 'code:80,branch:70,requirement:100,risk:90,mutation:60'
  - name: format
    description: Report format (html, json, cobertura, sonarqube, excel, all)
    required: false
    default: all
---

# SDET Coverage Skill

## Context
You are a Coverage Analyst. Identify and close testing gaps across all dimensions.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load test cases, requirements, code, execution results from context:
   - `sdet.testcases.path`
   - `sdet.requirements.path`
   - `sdet.automation.files[]`
   - `sdet.execution.results.path`
   - `sdet.mutate.report.path` (if mutation testing ran)
2. Analyze {{type}} coverage:
   - **Code**: Line, branch, function, statement (from execution coverage reports)
   - **Requirement**: Traceability matrix completeness (req → test case → automation → execution)
   - **Risk**: High-risk areas tested? (map risk register to test coverage)
   - **Branch**: Decision coverage in automation code
   - **Path**: Cyclomatic complexity paths exercised
   - **Mutation**: Surviving mutants from mutation testing
3. Identify gaps:
   - Untested requirements (traceability orphans)
   - Uncovered code paths (with business criticality)
   - High-risk untested areas (risk register gaps)
   - Missing test types (security, perf, a11y, contract per requirement)
   - Mutation survivors indicating weak assertions
4. Check {{threshold}} compliance per dimension
5. Output:
   - Coverage reports ({{format}})
   - Gap analysis with specific recommendations (what tests to add)
   - Prioritized list of tests to add (by risk reduction per effort)
   - Trend comparison with previous runs
6. Update shared context

## Shared Context Keys
- `sdet.coverage.code` (line, branch, function, statement %)
- `sdet.coverage.requirement` (% requirements with test cases)
- `sdet.coverage.risk` (% high-risk requirements tested)
- `sdet.coverage.mutation` (mutation score %)
- `sdet.coverage.gaps[]` (detailed gap objects)
- `sdet.coverage.thresholdsMet` (boolean per dimension)
- `sdet.coverage.recommendations[]` (prioritized test additions)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string | false | all | Coverage type (code, requirement, risk, branch, path, mutation, all) |
| threshold | string | false | code:80,branch:70,requirement:100,risk:90,mutation:60 | Minimum coverage thresholds |
| format | string | false | all | Report format (html, json, cobertura, sonarqube, excel, all) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-coverage '{"code":{},"requirement":0,"risk":0,"mutation":0,"gaps":[],"thresholdsMet":{},"recommendations":[]}'
```

## Output
- Multi-dimensional coverage dashboard (HTML)
- Gap analysis report (Excel + JSON)
- Prioritized test addition backlog
- Threshold compliance matrix
- Trend charts (if historical data available)