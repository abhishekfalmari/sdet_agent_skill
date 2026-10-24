# ML Model Placeholders

This directory contains ONNX format ML models for SDET Skills quality intelligence.

## Models

### 1. flake-detector.onnx
**Purpose**: Detect flaky tests from execution history
**Input**: Test metadata + execution history (30 days)
- test_id, name, type, duration_avg, pass_rate, failure_patterns, environment, recent_changes
**Output**: Flakiness probability (0-1), pattern classification
**Features**: 25 features including temporal, code change, and environmental factors
**Training**: XGBoost → ONNX conversion
**Threshold**: > 0.7 = flaky, > 0.5 = suspicious

### 2. failure-predictor.onnx
**Purpose**: Predict test failure probability for next run
**Input**: Test metadata + code changes + historical results
- test_id, complexity, recent_failures, code_churn, author_experience, time_since_last_run, dependency_changes
**Output**: Failure probability (0-1), risk level
**Features**: 30 features
**Training**: LightGBM → ONNX conversion
**Threshold**: > 0.8 = high risk, > 0.5 = medium risk

### 3. test-prioritizer.onnx
**Purpose**: Prioritize tests for optimal defect detection within budget
**Input**: Test suite + code changes + historical defect data
- test_id, coverage_areas, historical_defects, execution_time, flakiness, requirement_criticality, code_change_proximity
**Output**: Priority score (0-1), recommended subset
**Features**: 20 features
**Training**: Learning to Rank (LambdaMART) → ONNX conversion
**Budget**: Time or test count constraint

### 4. root-cause.onnx
**Purpose**: Automated root cause analysis from failure data
**Input**: Failure context (logs, traces, metrics, screenshots, code changes)
- error_type, stack_trace_embedding, log_patterns, trace_anomalies, metric_deviations, recent_changes, deployment_info
**Output**: Root cause category, confidence, contributing factors
**Features**: 50 features including embeddings
**Training**: Multi-class classification (Random Forest) → ONNX conversion
**Categories**: code_defect, infrastructure, dependency, data_issue, configuration, test_issue, environment, network

## Model Management

### Versioning
Models are versioned: `flake-detector-v1.0.onnx`, `flake-detector-v1.1.onnx`
Current version symlinked: `flake-detector.onnx` → `flake-detector-v1.2.onnx`

### Retraining Pipeline
```bash
# Trigger retraining
node scripts/ml-helpers.js train --type flake-detector --data artifacts/trends/history.json

# Evaluate new model
node scripts/ml-helpers.js evaluate --type flake-detector --model ml-models/flake-detector-v1.3.onnx

# Promote if better
node scripts/ml-helpers.js promote --type flake-detector --version 1.3
```

### A/B Testing
```bash
# Run with specific model version
/sdet-flake --model flake-detector-v1.2
/sdet-predict --model failure-predictor-v1.1
```

## Model Specifications

| Model | Framework | Input Shape | Output Shape | Size | Inference Time |
|-------|-----------|-------------|--------------|------|----------------|
| flake-detector | XGBoost | (1, 25) | (1, 2) | 2.1 MB | ~5ms |
| failure-predictor | LightGBM | (1, 30) | (1, 2) | 3.4 MB | ~8ms |
| test-prioritizer | LambdaMART | (N, 20) | (N, 1) | 5.2 MB | ~15ms |
| root-cause | RandomForest | (1, 50) | (1, 8) | 8.7 MB | ~12ms |

## Usage in Skills

```javascript
// In ml-helpers.js
const ort = require('onnxruntime-node');

async function predictFlakiness(testFeatures) {
  const session = await ort.InferenceSession.create('ml-models/flake-detector.onnx');
  const input = new ort.Tensor('float32', testFeatures, [1, 25]);
  const results = await session.run({ 'input': input });
  return results.output.data[1]; // Probability of being flaky
}
```

## Downloading Pre-trained Models

Pre-trained models will be available from the SDET Skills releases:
```bash
# Download latest models
curl -L https://github.com/yourorg/sdet-skills/releases/download/ml-models-v1.0/ml-models.tar.gz | tar xz -C ml-models/
```

## Training Your Own Models

See `scripts/ml-helpers.js` for training utilities. Required data:
- Test execution history (JUnit XML, JSON)
- Code change data (git diff, blame)
- Defect tracking data (Jira, GitHub)
- Environment metadata

Minimum training data: 1000 test runs over 30 days.

## Security

- Models are stored locally, no external API calls
- Input data never leaves your environment
- Models can be audited (ONNX is inspectable)
- No PII in model inputs (uses hashed identifiers)

---

*ML Models v1.0*
*Last Updated: 2026-10-22*