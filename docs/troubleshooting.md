# Troubleshooting Guide

Common issues and solutions when using SDET Skills.

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [Skill Execution Issues](#skill-execution-issues)
3. [Context & State Issues](#context--state-issues)
4. [Template Generation Issues](#template-generation-issues)
5. [CI/CD Pipeline Issues](#cicd-pipeline-issues)
6. [Automation Execution Issues](#automation-execution-issues)
7. [ML Model Issues](#ml-model-issues)
7. [Performance Issues](#performance-issues)
8. [Debugging Tips](#debugging-tips)

---

## Installation Issues

### Skill Not Found: `/sdet-*` command not recognized

**Cause**: Skill pack not installed or not in Claude Code's skill directory.

**Solution**:
```bash
# Verify installation
ls ~/.claude/skills/sdet/.claude/commands/

# Reinstall
git clone https://github.com/yourorg/sdet-skills.git ~/.claude/skills/sdet

# Restart Claude Code to reload skills
```

### Hook Not Running: Context not persisting between skills

**Cause**: Hooks not configured in settings.json

**Solution**:
```bash
# Check hooks configuration
cat ~/.claude/settings.json

# Run install script
node ~/.claude/skills/sdet/scripts/install.js

# Or manually add to settings.json:
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "sdet-*",
        "command": "node .claude/scripts/state-helpers.js load"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "sdet-*",
        "command": "node .claude/scripts/state-helpers.js save"
      }
    ]
  }
}
```

### Permission Denied: Cannot execute scripts

**Cause**: Scripts not executable or Node.js not in PATH

**Solution**:
```bash
# Make scripts executable
chmod +x ~/.claude/skills/sdet/scripts/*.js

# Verify Node.js
node --version
which node

# Use explicit node path if needed
/usr/local/bin/node .claude/scripts/state-helpers.js load
```

---

## Skill Execution Issues

### Skill Times Out

**Cause**: Large input, LLM processing, or external API calls taking too long.

**Solution**:
```bash
# Increase timeout in skill frontmatter or use async pattern
# For large Excel files, use streaming:
/sdet-generate --template standard --stream true

# For LLM-heavy skills, batch process:
/sdet-analyze --source ./requirements --batchSize 50
```

### Invalid Arguments Error

**Cause**: Missing required arguments or wrong format.

**Solution**:
```bash
# Check skill help
/sdet-analyze --help
/sdet-generate --help

# Common fixes:
# - Use --source ./path not --source=./path
# - Boolean flags: --strict true not --strict=true
# - JSON args: --config '{"key": "value"}' (single quotes)
```

### Template Not Found

**Cause**: Template file missing or wrong path.

**Solution**:
```bash
# List available templates
ls ~/.claude/skills/sdet/templates/excel/
ls ~/.claude/skills/sdet/templates/automation/

# Generate missing templates
cd ~/.claude/skills/sdet
node templates/excel/standard.xlsx.template.js
node templates/automation/playwright/pom.template.js
```

---

## Context & State Issues

### Context Lost Between Skills

**Cause**: Hook not firing, state file corrupted, or wrong working directory.

**Solution**:
```bash
# Check context file exists
cat .claude/context/sdet-context.json

# Manual load/save
node .claude/scripts/state-helpers.js load
node .claude/scripts/state-helpers.js save sdet-analyze '{"count": 10}'

# Verify working directory
pwd
# Must be project root where .claude/ exists
```

### Context Pollution: Wrong Data in Context

**Cause**: Previous run's context not cleared, or skill exporting wrong keys.

**Solution**:
```bash
# Clear context
node .claude/scripts/state-helpers.js clear

# Or delete context file
rm .claude/context/sdet-context.json

# Check context mapping
cat .claude/scripts/context-helpers.js | grep -A 5 "SKILL_CONTEXT_MAP"
```

### Checkpoint Resume Fails

**Cause**: Checkpoint file corrupted or skill sequence changed.

**Solution**:
```bash
# List checkpoints
node .claude/scripts/checkpoint-helpers.js list

# Resume from specific checkpoint
/sdet-orchestrate --resume <runId> --from-checkpoint validate

# Force fresh run
/sdet-orchestrate --workflow full --autoApprove --fresh
```

---

## Template Generation Issues

### Excel File Corrupted / Won't Open

**Cause**: ExcelJS buffer not written correctly, or file locked.

**Solution**:
```bash
# Regenerate template
cd ~/.claude/skills/sdet
node templates/excel/standard.xlsx.template.js

# Check file size (should be > 50KB)
ls -lh templates/excel/standard.xlsx

# Verify with ExcelJS
node -e "
const ExcelJS = require('exceljs');
const wb = new ExcelJS.Workbook();
wb.xlsx.readFile('templates/excel/standard.xlsx').then(() => {
  console.log('Sheets:', wb.worksheets.map(s => s.name));
  console.log('Rows:', wb.worksheets[0].rowCount);
});
"
```

### Excel Data Validation Not Working

**Cause**: Data validation requires Excel application to evaluate.

**Solution**:
```bash
# Data validation works in Excel/LibreOffice, not in CSV viewers
# Open in Excel to see dropdowns
# For programmatic validation, use the validation script:
node .claude/scripts/validate-skills.js --excel artifacts/test-cases/latest.xlsx
```

### Automation Template Missing Framework

**Cause**: Framework template not generated.

**Solution**:
```bash
# Generate all framework templates
cd ~/.claude/skills/sdet
node templates/automation/playwright/pom.template.js
node templates/automation/cypress/pom.template.js
node templates/automation/appium/pom.template.js
node templates/automation/k6/load-test.template.js
```

---

## CI/CD Pipeline Issues

### Pipeline Fails: "sdet-* command not found"

**Cause**: Skill pack not installed in CI environment.

**Solution**:
```yaml
# Add to CI before running skills
- name: Install SDET Skills
  run: |
    git clone https://github.com/yourorg/sdet-skills.git ~/.claude/skills/sdet
    cd ~/.claude/skills/sdet && npm ci

# Or use pre-built Docker image
- uses: docker://yourorg/sdet-skills:latest
```

### Pipeline Fails: Quality Gate Blocking

**Cause**: Coverage, security, or performance thresholds not met.

**Solution**:
```bash
# Check what failed
/sdet-coverage --type all --threshold '{"code": 80}'

# Temporarily lower gates for debugging
/sdet-deploy --platform github-actions --qualityGates false

# Or adjust thresholds in config
# quality-gates.yaml:
code_coverage: 60  # Lower from 80
```

### Artifacts Not Uploading

**Cause**: Path mismatch or artifact size limit.

**Solution**:
```yaml
# Check paths match
- uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: artifacts/results/**  # Must match actual output
    retention-days: 30

# For large artifacts, use artifact storage
- name: Upload to S3
  run: aws s3 cp artifacts/ s3://bucket/artifacts/ --recursive
```

---

## Automation Execution Issues

### Playwright Tests Timeout

**Cause**: Page not loading, selector wrong, or network slow.

**Solution**:
```bash
# Increase timeout
/sdet-execute --type ui --timeout 120000

# Debug with headed mode
/sdet-execute --type ui --headed --debug

# Check selectors
/sdet-autoheal --target selectors --mode suggest
```

### k6 Load Test Fails: "Connection Refused"

**Cause**: Target service not running or wrong URL.

**Solution**:
```bash
# Verify target
curl -v https://api.example.com/health

# Check k6 script baseURL
grep baseURL tests/performance/k6/*.js

# Use environment variable
BASE_URL=https://staging.api.example.com /sdet-execute --type performance
```

### Tests Flaky: Pass on Retry

**Cause**: Timing issues, race conditions, or environment instability.

**Solution**:
```bash
# Detect flaky tests
/sdet-flake --window 30 --action detect

# Auto-quarantine
/sdet-flake --window 30 --action quarantine

# Fix with autoheal
/sdet-autoheal --target waits --mode auto-apply
/sdet-autoheal --target selectors --mode suggest
```

---

## ML Model Issues

### Model Not Found: "flake-detector.onnx not found"

**Cause**: ML models not downloaded or generated.

**Solution**:
```bash
# Check models directory
ls ~/.claude/skills/sdet/ml-models/

# Download pre-trained models (when available)
# Or train your own:
node ~/.claude/skills/sdet/scripts/ml-helpers.js train --type flake-detector

# For now, use rule-based fallback (default)
/sdet-flake --model rule-based
```

### ONNX Runtime Error

**Cause**: Incompatible ONNX version or missing dependencies.

**Solution**:
```bash
# Install ONNX Runtime
npm install onnxruntime-node

# Check version compatibility
node -e "console.log(require('onnxruntime-node').version)"

# Reinstall with native build
npm rebuild onnxruntime-node
```

### Prediction Accuracy Low

**Cause**: Model not trained on your data, or feature drift.

**Solution**:
```bash
# Retrain with your data
node .claude/scripts/ml-helpers.js train \
  --type failure-predictor \
  --data artifacts/trends/history.json \
  --epochs 50

# Check feature importance
node .claude/scripts/ml-helpers.js explain --type failure-predictor
```

---

## Performance Issues

### Slow Skill Execution

**Cause**: Large datasets, no caching, or sequential processing.

**Solution**:
```bash
# Enable parallel processing
/sdet-execute --parallel 8
/sdet-automate --parallel 4

# Use caching
export SDET_CACHE_DIR=/tmp/sdet-cache
/sdet-analyze --source ./requirements --cache true

# Process in batches
/sdet-generate --batchSize 100 --template standard
```

### High Memory Usage

**Cause**: Large Excel files loaded entirely in memory.

**Solution**:
```bash
# Use streaming for large files
/sdet-generate --stream true --template standard
/sdet-validate --stream true --file large-file.xlsx

# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" /sdet-orchestrate --workflow full
```

### Context File Too Large

**Cause**: Accumulated context from many runs.

**Solution**:
```bash
# Prune old context
node .claude/scripts/state-helpers.js prune --days 7

# Or limit context size in state-helpers.js
# MAX_CONTEXT_SIZE = 10 * 1024 * 1024  # 10MB
```

---

## Debugging Tips

### Enable Verbose Logging

```bash
# Set debug environment variable
DEBUG=sdet:* /sdet-orchestrate --workflow full

# Or per skill
DEBUG=sdet:analyze /sdet-analyze --source ./requirements
```

### Inspect Context at Each Step

```bash
# Add debug output to skill
# In skill markdown, add:
## Debug
echo "Context: $(cat .claude/context/sdet-context.json | jq '.sdet.analyze')"
```

### Check Skill Execution Order

```bash
# View orchestration log
cat .claude/context/sdet-context.json | jq '.sdet.run.history'

# Or use checkpoint helper
node .claude/scripts/checkpoint-helpers.js status --runId <runId>
```

### Validate Skill Definitions

```bash
# Run validation
node .claude/scripts/validate-skills.js

# Run linting
node .claude/scripts/lint-skills.js
```

### Test Individual Skills in Isolation

```bash
# Create minimal test context
echo '{"sdet":{"requirements":{"count":5,"path":"artifacts/requirements/req.json"}}}' > .claude/context/sdet-context.json

# Run single skill
/sdet-generate --template standard
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT: no such file` | Path wrong | Check working directory, use absolute paths |
| `EACCES: permission denied` | No execute permission | `chmod +x scripts/*.js` |
| `Context key not found` | Dependency not run | Run prerequisite skills first |
| `Template validation failed` | Schema mismatch | Run `validate-skills.js` |
| `ML model load failed` | ONNX version mismatch | Reinstall `onnxruntime-node` |
| `Quality gate failed` | Threshold not met | Adjust gates or fix underlying issues |
| `Checkpoint not found` | Wrong runId | List checkpoints with `checkpoint-helpers.js list` |

---

## Getting Help

1. **Check logs**: `.claude/logs/sdet-<skill>-<timestamp>.log`
2. **Run validation**: `node scripts/validate-skills.js`
3. **Search issues**: GitHub Issues in skill pack repo
4. **Enable debug**: `DEBUG=sdet:* command`
5. **Minimal reproduction**: Create minimal test case

---

*Troubleshooting Guide v1.0*
*Last Updated: 2026-10-22*