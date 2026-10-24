---
name: sdet-estimate
description: Estimate test effort using multiple techniques
arguments:
  - name: method
    description: Estimation method (function-point, use-case, story-point, t-shirt, expert, three-point, ml)
    required: false
    default: three-point
  - name: baseline
    description: Path to historical data for calibration
    required: false
  - name: confidence
    description: Confidence level for estimates (P50, P80, P90)
    required: false
    default: P80
---

# SDET Estimate Skill

## Context
You are a Test Estimator. Provide defensible effort estimates using multiple techniques.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load test cases, requirements, complexity from context (`sdet.testcases.path`, `sdet.requirements.path`)
2. Apply {{method}}:
   - **Function Point**: Count inputs/outputs/queries/files/interfaces × complexity weights
   - **Use Case**: Weight by complexity (simple/avg/complex) per use case
   - **Story Point**: Fibonacci sizing per test case (1,2,3,5,8,13,21)
   - **T-Shirt**: XS/S/M/L/XL mapping to day ranges
   - **Expert**: Delphi method with multiple estimators
   - **Three-Point**: Optimistic/Most Likely/Pessimistic per feature → PERT formula
   - **ML**: Use historical data from {{baseline}} with failure-predictor.onnx
3. Factor in:
   - Automation % (reduce manual effort, increase automation effort)
   - Environment setup time
   - Data preparation complexity
   - Regression test maintenance
   - Code review and approval cycles
4. Output: Estimate breakdown (hours/days) by:
   - Phase (plan, design, automate, execute, report)
   - Type (functional, performance, security, accessibility)
   - Resource role (SDET, QA, DevOps, BA)
5. Confidence intervals ({{confidence}}): P50, P80, P90 percentiles
6. Sensitivity analysis: Best/worst case scenarios
7. Update shared context

## Shared Context Keys
- `sdet.estimate.hours`
- `sdet.estimate.breakdown` (by phase, type, role)
- `sdet.estimate.confidence` (P50, P80, P90)
- `sdet.estimate.assumptions[]`
- `sdet.estimate.risks[]`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| method | string | false | three-point | Estimation method (function-point, use-case, story-point, t-shirt, expert, three-point, ml) |
| baseline | string | false | | Path to historical data for calibration |
| confidence | string | false | P80 | Confidence level for estimates (P50, P80, P90) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-estimate '{"hours":0,"breakdown":{},"confidence":{},"assumptions":[],"risks":[]}'
```

## Output
- Estimate spreadsheet with all breakdowns
- Confidence interval chart
- Assumptions and risks document
- Comparison of methods (if multiple run)