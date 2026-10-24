# Extending SDET Skills

This guide explains how to extend the SDET Skills pack with custom skills, templates, integrations, and ML models.

## Table of Contents
1. [Creating Custom Skills](#creating-custom-skills)
2. [Adding Custom Templates](#adding-custom-templates)
3. [Adding Custom Integrations](#adding-custom-integrations)
4. [Adding Custom ML Models](#adding-custom-ml-models)
5. [Custom CI/CD Platforms](#custom-cicd-platforms)
6. [Custom Notification Channels](#custom-notification-channels)
7. [Skill Packaging & Distribution](#skill-packaging--distribution)

---

## Creating Custom Skills

### 1. Skill File Structure

Create a new file at `.claude/commands/sdet-custom.md`:

```markdown
---
name: sdet-custom
description: Brief description of your skill
arguments:
  - name: param1
    description: Description of parameter
    required: false
    default: "default-value"
  - name: param2
    description: Another parameter
    required: true
---

# SDET Custom Skill

## Context
You are an SDET specialist. {{description}}.

## Instructions
1. **Load context**: `node .claude/scripts/state-helpers.js load`
2. **Validate inputs** from `{{param1}}` and `{{param2}}`
3. **Do your work** - implement your custom logic
4. **Save context**: `node .claude/scripts/state-helpers.js save sdet-custom {...}`

## Shared Context Keys
- `sdet.custom.key1`
- `sdet.custom.key2`

## Arguments Reference
- **param1** (optional): Description. Default: "default-value"
- **param2** (required): Description

## Output
- `artifacts/custom/output-<timestamp>.json`
- Updated shared context with custom metadata

## Example Usage
```bash
/sdet-custom --param1 "value1" --param2 "value2"
```

## Implementation Notes
- Use `node .claude/scripts/state-helpers.js load` to load context
- Use `node .claude/scripts/state-helpers.js save sdet-custom {...}` to save
- Follow the existing skill patterns for consistency
```

### 2. Register Context Mapping

Add your skill to `scripts/context-helpers.js` in the `SKILL_CONTEXT_MAP`:

```javascript
'sdet-custom': {
  imports: ['requirements.path', 'testcases.path'],  // Keys you need
  exports: ['custom.key1', 'custom.key2']            // Keys you produce
}
```

### 3. Add to Orchestrator (Optional)

If you want your skill in a workflow, update `scripts/checkpoint-helpers.js`:

```javascript
customWorkflow: {
  name: 'Custom Workflow',
  stages: [
    { id: 'analyze', skills: ['analyze'] },
    { id: 'custom', skills: ['custom'], dependsOn: ['analyze'] }
  ]
}
```

### 4. Validate

```bash
node scripts/validate-skills.js
node scripts/lint-skills.js
```

---

## Adding Custom Templates

### Excel Templates

1. Create generator script: `templates/excel/custom.xlsx.template.js`

```javascript
const ExcelJS = require('exceljs');

async function generateCustomTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Custom Tests');
  
  sheet.columns = [
    { header: 'Test Case ID', key: 'testCaseId', width: 15 },
    { header: 'Custom Field', key: 'customField', width: 30 },
    // ... your columns
  ];
  
  // Add data validation, conditional formatting, examples
  
  return await workbook.xlsx.writeBuffer();
}

if (require.main === module) {
  generateCustomTemplate()
    .then(buffer => require('fs').writeFileSync('templates/excel/custom.xlsx', buffer))
    .catch(console.error);
}

module.exports = { generateCustomTemplate };
```

2. Run to generate: `node templates/excel/custom.xlsx.template.js`

3. Reference in your skill: `templatePath: "./templates/excel/custom.xlsx"`

### Automation Templates

1. Create template directory: `templates/automation/custom-framework/`

2. Add generator: `templates/automation/custom-framework/template.js`

```javascript
const templates = {
  'test-file.ts': `import { test, expect } from '@playwright/test';

test.describe('{{featureName}}', () => {
  {{#each testCases}}
  test('{{title}}', async ({ page }) => {
    // Your custom test pattern
    {{#each steps}}
    {{code}}
    {{/each}}
  });
  {{/each}}
});
`,
  
  'config.ts': `export const config = {
  baseURL: '{{baseUrl}}',
  // Your framework config
};
`
};

async function generateTemplates(outputDir, data) {
  const Handlebars = require('handlebars');
  // Render and write templates
}

module.exports = { templates, generateTemplates };
```

### CI/CD Templates

1. Create platform directory: `templates/cicd/custom-platform/`

2. Add template: `templates/cicd/custom-platform/pipeline.yml.template`

```yaml
# Custom CI/CD Platform Pipeline
stages:
  - test
  - deploy

jobs:
  test:
    stage: test
    script:
      - npx sdet-analyze --source ./requirements
      - npx sdet-generate --template standard
      - npx sdet-validate
      - npx sdet-automate --type all
      - npx sdet-execute --parallel 4
      - npx sdet-analyze-results --updateExcel true
  
  deploy:
    stage: deploy
    script:
      - echo "Deploy to custom platform"
```

---

## Adding Custom Integrations

### Helper Script Pattern

Create `scripts/custom-integration-helpers.js`:

```javascript
/**
 * Custom Integration Helpers
 * Example: Integration with TestRail, Zephyr, qTest, etc.
 */

const axios = require('axios');

class CustomIntegrationClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.token = config.token;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
  }

  async createTestCase(testCase) {
    const response = await this.client.post('/test-cases', testCase);
    return response.data;
  }

  async updateTestResult(testCaseId, result) {
    const response = await this.client.post(`/test-cases/${testCaseId}/results`, result);
    return response.data;
  }

  async getTestPlan(planId) {
    const response = await this.client.get(`/test-plans/${planId}`);
    return response.data;
  }
}

async function syncToCustomSystem(context, config) {
  const client = new CustomIntegrationClient(config);
  
  // Get test cases from context
  const testCases = getContextValue(context, 'sdet.testcases.data') || [];
  
  for (const tc of testCases) {
    if (tc.automationStatus === 'Automated') {
      await client.createTestCase({
        title: tc.title,
        automationId: tc.automationId,
        // ... map fields
      });
    }
  }
  
  // Save sync result
  await saveContext('custom-integration', {
    syncedCount: testCases.length,
    lastSync: new Date().toISOString()
  });
}

module.exports = { CustomIntegrationClient, syncToCustomSystem };
```

### Register in Skills

Use in your skill:

```markdown
## Instructions
1. Load context
2. Load integration config from `sdet.config.customIntegration`
3. Call `node -e "require('./scripts/custom-integration-helpers').syncToCustomSystem(context, config)"`
4. Save results to context
```

---

## Adding Custom ML Models

### 1. Model Requirements

- Format: ONNX (.onnx)
- Runtime: ONNX Runtime Node.js
- Input/Output: Defined JSON schemas

### 2. Add Model

1. Place model in `ml-models/your-model.onnx`

2. Create model handler: `scripts/ml-custom-model.js`

```javascript
const ort = require('onnxruntime-node');
const path = require('path');

class CustomModel {
  constructor() {
    this.session = null;
    this.inputName = null;
    this.outputNames = [];
  }

  async load(modelPath = 'ml-models/your-model.onnx') {
    this.session = await ort.InferenceSession.create(modelPath);
    this.inputName = this.session.inputNames[0];
    this.outputNames = this.session.outputNames;
  }

  async predict(input) {
    if (!this.session) await this.load();
    
    const feeds = { [this.inputName]: input };
    const results = await this.session.run(feeds);
    
    return this.outputNames.map(name => results[name].data);
  }
}

async function runCustomPrediction(context) {
  const model = new CustomModel();
  
  // Prepare input from context
  const features = prepareFeatures(context);
  const input = new ort.Tensor('float32', features, [1, features.length]);
  
  const predictions = await model.predict(input);
  
  // Save to context
  await saveContext('custom-ml', {
    predictions: predictions[0],
    modelVersion: '1.0.0',
    predictedAt: new Date().toISOString()
  });
}

function prepareFeatures(context) {
  // Extract features from context
  return new Float32Array([/* your features */]);
}

module.exports = { CustomModel, runCustomPrediction };
```

3. Register in `scripts/ml-helpers.js`:

```javascript
const { runCustomPrediction } = require('./ml-custom-model');

ML_MODELS['custom-model'] = {
  handler: runCustomPrediction,
  inputSchema: { /* JSON schema */ },
  outputSchema: { /* JSON schema */ }
};
```

---

## Custom CI/CD Platforms

### 1. Create Platform Template

`templates/cicd/custom-platform/pipeline.template.js`:

```javascript
const template = (context, config) => `
# Custom Platform Pipeline
# Generated by SDET Skills

stages:
  - analyze
  - generate
  - validate
  - automate
  - execute
  - analyze-results
  - deploy

variables:
  NODE_VERSION: "20"
  SDET_WORKFLOW: "${config.workflow || 'ci'}"

analyze:
  stage: analyze
  script:
    - npm ci
    - npx sdet-analyze --source ./requirements
  artifacts:
    paths: [artifacts/requirements/]

generate:
  stage: generate
  needs: [analyze]
  script:
    - npm ci
    - npx sdet-generate --template ${config.template || 'standard'}
  artifacts:
    paths: [artifacts/test-cases/]

# ... more stages
`;

module.exports = { template };
```

### 2. Register in Deploy Skill

Update `sdet-deploy.md` to include your platform in the platform argument enum.

---

## Custom Notification Channels

### 1. Add Channel Handler

`scripts/notify-custom-channel.js`:

```javascript
async function sendCustomNotification(webhookUrl, templateName, data) {
  const templates = {
    pipelineStart: {
      title: '🚀 Pipeline Started',
      fields: {
        workflow: data.workflow,
        runId: data.runId,
        // ...
      }
    },
    // ... more templates
  };
  
  const template = templates[templateName];
  if (!template) throw new Error(`Unknown template: ${templateName}`);
  
  const payload = {
    // Your platform's payload format
    title: template.title,
    fields: template.fields,
    timestamp: new Date().toISOString()
  };
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Notification failed: ${response.status}`);
  }
  
  return { success: true };
}

module.exports = { sendCustomNotification };
```

### 2. Register in Notify Helpers

Update `scripts/notify-helpers.js` to include your channel.

---

## Skill Packaging & Distribution

### 1. As NPM Package

```json
// package.json
{
  "name": "@yourorg/sdet-skills-custom",
  "version": "1.0.0",
  "files": [
    ".claude/commands/sdet-custom.md",
    "templates/excel/custom.xlsx",
    "templates/automation/custom-framework/",
    "scripts/custom-integration-helpers.js",
    "ml-models/custom-model.onnx"
  ],
  "scripts": {
    "postinstall": "node scripts/install-custom.js"
  }
}
```

### 2. As Git Submodule

```bash
# In consumer repo
git submodule add https://github.com/yourorg/sdet-skills-custom.git .claude/skills/sdet-custom
```

### 3. As Separate Repo

Users can install multiple skill packs:

```bash
# Main SDET skills
git clone https://github.com/yourorg/sdet-skills.git ~/.claude/skills/sdet

# Custom extensions
git clone https://github.com/yourorg/sdet-skills-custom.git ~/.claude/skills/sdet-custom
```

Claude Code will load skills from all directories under `~/.claude/skills/`.

---

## Best Practices

1. **Follow naming convention**: `sdet-<category>-<action>`
2. **Use shared helpers** - Don't duplicate state/context logic
3. **Document context keys** - Clearly define imports/exports
4. **Add validation** - Validate inputs and context requirements
5. **Test in isolation** - Each skill should work independently
6. **Version your extensions** - Use semantic versioning
7. **Share via registry** - Publish to npm or internal registry

---

## Example: Complete Custom Skill Pack

```
sdet-skills-custom/
├── .claude/commands/
│   ├── sdet-custom-smoke.md
│   ├── sdet-custom-a11y-audit.md
│   └── sdet-custom-perf-baseline.md
├── templates/
│   ├── excel/
│   │   └── smoke.xlsx.template.js
│   └── automation/
│       └── custom-framework/
├── scripts/
│   ├── custom-integration-helpers.js
│   └── ml-custom-model.js
├── ml-models/
│   └── custom-model.onnx
├── package.json
└── README.md
```

This can be installed alongside the main SDET Skills pack for organization-specific extensions.

---

*Extending Guide v1.0*
*Last Updated: 2026-10-22*