---
name: sdet-predict
description: Predict test failures and prioritize using ML
arguments:
  - name: model
    description: Model to use (failure-predictor, test-prioritizer, custom)
    required: false
    default: failure-predictor
  - name: horizon
    description: Prediction horizon (next-run, next-day, next-week, next-sprint)
    required: false
    default: next-run
  - name: threshold
    description: Probability threshold for high-risk (0-1)
    required: false
    default: 0.7
---

# SDET Predict Skill

## Context
You are a Predictive QA Engineer. Anticipate failures before they happen.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load historical data from context:
   - `sdet.execution.results.path` (test results history)
   - `sdet.defect.created[]` (defect history)
   - Git history (code changes, authors, files)
   - `sdet.flake.flaky[]` (flaky test registry)
   - `sdet.mutate.survivors[]` (weakly tested code)
   - CI/CD pipeline data (build duration, environment)
2. Feature engineering per test:
   - **Test metadata**: Type (UI/API/unit), duration, assertions count, flakiness history
   - **Code churn**: Lines changed, files changed, commit frequency, author experience
   - **Complexity**: Cyclomatic, cognitive, nesting depth, dependency count
   - **Recent failures**: Last N runs pass/fail, failure patterns
   - **Dependencies**: External services, databases, queues, third-party APIs
   - **Environment**: OS, browser, device, data state, deployment version
3. Run {{model}} (ONNX/TensorFlow.js) for {{horizon}}:
   - **failure-predictor.onnx**: Binary classification (pass/fail) per test
     - Features: 50+ engineered features
     - Output: Failure probability [0,1]
   - **test-prioritizer.onnx**: Ranking model (learning to rank)
     - Features: Test + code change pairs
     - Output: Priority score for ordering
   - **Custom**: User-provided ONNX model
4. Output predictions:
   - Failure probability per test (ranked descending)
   - **Recommended subset**: "Run these 20% to find 80% of bugs" (Pareto)
   - Risk heatmap by module/feature/component
   - Confidence intervals per prediction
   - Feature importance (SHAP values)
5. Integrate with `/sdet-prioritize` for execution ordering
6. Feedback loop: Store predictions vs actuals for model retraining
7. Update shared context

## Shared Context Keys
- `sdet.predict.probabilities[]` (testId, probability, confidence, features)
- `sdet.predict.recommended-subset[]` (testIds for max defect detection)
- `sdet.predict.risk-heatmap` (module → risk score)
- `sdet.predict.model-version` (model version used)
- `sdet.predict.feature-importance[]` (feature, SHAP value)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| model | string | false | failure-predictor | Model to use (failure-predictor, test-prioritizer, custom) |
| horizon | string | false | next-run | Prediction horizon (next-run, next-day, next-week, next-sprint) |
| threshold | number | false | 0.7 | Probability threshold for high-risk |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-predict '{"probabilities":[],"recommendedSubset":[],"riskHeatmap":{},"modelVersion":"","featureImportance":[]}'
```

## Output
- Ranked test list by failure probability
- Optimal test subset for budget
- Risk heatmap visualization
- Model performance metrics