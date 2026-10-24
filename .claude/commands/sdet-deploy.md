---
name: sdet-deploy
description: Generate CI/CD pipeline configuration
arguments:
  - name: platform
    description: CI/CD platform (github-actions, gitlab-ci, jenkins, azure-devops, circleci, bitbucket, tekton)
    required: false
    default: github-actions
  - name: qualityGates
    description: Enable quality gates (coverage, performance, security)
    required: false
    default: true
  - name: environments
    description: Comma-separated environments (dev,staging,production)
    required: false
    default: dev,staging
  - name: matrix
    description: Enable matrix testing (browsers, nodes, os)
    required: false
    default: true
---

# SDET Deploy Skill

## Context
You are an SDET DevOps engineer. Generate production-ready CI/CD pipelines for test execution.

## Instructions
1. **Load context**: `node .sdet-skills/scripts/state-helpers.js load`
3. **Load automation structure** from shared context (`sdet.automation.files[]`, `sdet.automation.types[]`)
4. **Load execution config** from `sdet.execution.summary` if available
5. **Generate pipeline for `{{platform}}`**:

### GitHub Actions (`.github/workflows/sdet-pipeline.yml`)
```yaml
name: SDET Test Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Nightly
  workflow_dispatch:
    inputs:
      workflow:
        type: choice
        options: [full, quick, ci, security, performance]
        default: full

env:
  SDET_WORKFLOW: ${{ github.event.inputs.workflow || 'ci' }}
  NODE_VERSION: '20'

jobs:
  analyze:
    if: ${{ env.SDET_WORKFLOW == 'full' || env.SDET_WORKFLOW == 'security' || env.SDET_WORKFLOW == 'performance' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - run: npx sdet-analyze --source ./requirements
      - uses: actions/upload-artifact@v4
        with: { name: requirements, path: artifacts/requirements/ }

  generate:
    needs: [analyze]  # or none for ci workflow
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - run: npx sdet-generate --template ${{ env.SDET_WORKFLOW == 'security' && 'security' || env.SDET_WORKFLOW == 'performance' && 'performance' || 'standard' }}
      - uses: actions/upload-artifact@v4
        with: { name: testcases, path: artifacts/test-cases/ }

  validate:
    needs: [generate]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - run: npx sdet-validate --strict ${{ env.SDET_WORKFLOW != 'ci' }}
      - uses: actions/upload-artifact@v4
        with: { name: validation, path: artifacts/validation/ }

  automate:
    needs: [validate]
    runs-on: ubuntu-latest
    strategy:
      matrix:
        type: [ui, api]  # Add security, performance, accessibility, contract based on workflow
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - run: npx sdet-automate --type ${{ matrix.type }} --framework playwright
      - uses: actions/upload-artifact@v4
        with: { name: automation-${{ matrix.type }}, path: tests/${{ matrix.type }}/ }

  execute:
    needs: [automate]
    runs-on: ubuntu-latest
    strategy:
      matrix:
        type: [ui, api]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx sdet-execute --type ${{ matrix.type }} --parallel 4 --retry 2
      - uses: actions/upload-artifact@v4
        with: { name: results-${{ matrix.type }}, path: artifacts/results/ }

  analyze-results:
    needs: [execute]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - run: npx sdet-analyze-results --updateExcel true --createDefects ${{ github.event_name == 'schedule' }}
      - uses: actions/upload-artifact@v4
        with: { name: analysis, path: artifacts/analysis/ }
        if: always()

  quality-gates:
    needs: [analyze-results]
    if: ${{ env.SDET_WORKFLOW != 'quick' && env.SDET_WORKFLOW != 'ci' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ env.NODE_VERSION }} }
      - run: npm ci
      - name: Check coverage
        run: |
          COVERAGE=$(cat artifacts/results/coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then exit 1; fi
      - name: Check critical failures
        run: |
          FAILURES=$(cat artifacts/results/execution-summary-*.json | jq '.summary.failed')
          if [ "$FAILURES" -gt 0 ]; then exit 1; fi
      - name: Check performance budgets
        run: |
          # Check k6 thresholds
          pass

  deploy:
    needs: [quality-gates]
    if: ${{ github.ref == 'refs/heads/main' && github.event_name == 'push' }}
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: echo "Deploy step - implement your deployment"
```

### GitLab CI (`.gitlab-ci.yml`)
```yaml
stages:
  - analyze
  - generate
  - validate
  - automate
  - execute
  - analyze-results
  - quality-gates
  - deploy

variables:
  NODE_VERSION: "20"
  SDET_WORKFLOW: "ci"

analyze:
  stage: analyze
  script:
    - npm ci
    - npx sdet-analyze --source ./requirements
  artifacts:
    paths:
      - artifacts/requirements/
    expire_in: 1 week

generate:
  stage: generate
  needs: [analyze]
  script:
    - npm ci
    - npx sdet-generate --template standard
  artifacts:
    paths:
      - artifacts/test-cases/
    expire_in: 1 week

validate:
  stage: validate
  needs: [generate]
  script:
    - npm ci
    - npx sdet-validate --strict false
  artifacts:
    paths:
      - artifacts/validation/
    expire_in: 1 week

# ... similar for automate, execute, analyze-results
```

### Jenkins (`Jenkinsfile`)
```groovy
pipeline {
    agent any
    environment {
        NODE_VERSION = '20'
        SDET_WORKFLOW = 'full'
    }
    stages {
        stage('Analyze') {
            when { expression { env.SDET_WORKFLOW != 'ci' && env.SDET_WORKFLOW != 'quick' } }
            steps {
                sh 'npm ci'
                sh 'npx sdet-analyze --source ./requirements'
            }
        }
        stage('Generate') {
            steps {
                sh 'npm ci'
                sh 'npx sdet-generate --template standard'
            }
        }
        stage('Validate') {
            steps {
                sh 'npm ci'
                sh 'npx sdet-validate'
            }
        }
        stage('Automate') {
            parallel {
                stage('UI') { steps { sh 'npx sdet-automate --type ui --framework playwright' } }
                stage('API') { steps { sh 'npx sdet-automate --type api --framework pactum' } }
            }
        }
        stage('Execute') {
            parallel {
                stage('UI') { steps { sh 'npx sdet-execute --type ui --parallel 4' } }
                stage('API') { steps { sh 'npx sdet-execute --type api --parallel 4' } }
            }
        }
        stage('Analyze Results') {
            steps {
                sh 'npm ci'
                sh 'npx sdet-analyze-results --updateExcel true'
            }
        }
        stage('Quality Gates') {
            when { expression { env.SDET_WORKFLOW == 'full' } }
            steps {
                sh 'npm ci'
                sh 'npx sdet-coverage --threshold "80"'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'artifacts/**/*', fingerprint: true
        }
    }
}
```

### Azure DevOps (`azure-pipelines.yml`)
```yaml
trigger:
  - main
  - develop

variables:
  NODE_VERSION: '20'

stages:
  - stage: Analyze
    condition: ne(variables['SDET_WORKFLOW'], 'ci')
    jobs:
      - job: Analyze
        pool: { vmImage: 'ubuntu-latest' }
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: $(NODE_VERSION) }
          - script: npm ci
          - script: npx sdet-analyze --source ./requirements
          - publish: artifacts/requirements
            artifact: requirements

  - stage: Generate
    dependsOn: Analyze
    jobs:
      - job: Generate
        pool: { vmImage: 'ubuntu-latest' }
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: $(NODE_VERSION) }
          - script: npm ci
          - script: npx sdet-generate --template standard
          - publish: artifacts/test-cases
            artifact: testcases

  # ... similar for other stages
```

6. **Quality Gates** (if `{{qualityGates}}`):
   - Coverage threshold (default 80%)
   - Zero critical/high failures
   - Performance budgets (p95 < threshold)
   - Security scan pass (no critical vulns)
   - Accessibility score (WCAG AA)

7. **Matrix Testing** (if `{{matrix}}`):
   - Browsers: chromium, firefox, webkit
   - OS: ubuntu, windows, macos
   - Node versions: 18, 20, 22

8. **Output pipeline files** to platform-specific locations
9. **Update shared context**:
   ```javascript
   await saveContext('deploy', {
     pipelinePath: outputPath,
     platform: '{{platform}}',
     stages: generatedStages,
     qualityGates: qualityGatesConfig
   });
   ```

## Shared Context Keys
- `sdet.pipeline.path`
- `sdet.pipeline.platform`
- `sdet.pipeline.stages[]`
- `sdet.pipeline.qualityGates`

## Arguments Reference
- **platform** (optional): CI/CD platform - github-actions, gitlab-ci, jenkins, azure-devops, circleci, bitbucket, tekton. Default: github-actions
- **qualityGates** (optional): Enable quality gates. Default: true
- **environments** (optional): Comma-separated environments - dev,staging,production. Default: dev,staging
- **matrix** (optional): Enable matrix testing. Default: true

## Output
- `.github/workflows/sdet-pipeline.yml` (GitHub Actions)
- `.gitlab-ci.yml` (GitLab CI)
- `Jenkinsfile` (Jenkins)
- `azure-pipelines.yml` (Azure DevOps)
- Updated shared context with pipeline metadata

## Example Usage
```bash
/sdet-deploy --platform github-actions --qualityGates true --matrix true
/sdet-deploy --platform gitlab-ci --environments dev,staging,production
/sdet-deploy --platform jenkins --qualityGates true
```

## Implementation Notes
- Use `node .sdet-skills/scripts/state-helpers.js load` to load context
- Use `node .sdet-skills/scripts/state-helpers.js save sdet-deploy {...}` to save
- Use templates from `templates/cicd/<platform>/`
- Include secrets management (GitHub Secrets, GitLab CI Variables, Jenkins Credentials)
- Support self-hosted runners
- Generate pipeline visualization (Mermaid diagram)