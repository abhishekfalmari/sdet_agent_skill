# SDET Skills - Architecture Documentation

## Overview

This document describes the architecture of the SDET Skills system - a comprehensive Claude Code skill pack for Software Development Engineer in Test workflows.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SDET SKILLS ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   User/CLI   │───▶│  Slash Cmd   │───▶│   Skill      │───▶│  Shared  │  │
│  │  (Terminal)  │    │  (/sdet-*)   │    │  Definition  │    │  Context │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────┬─────┘  │
│                                                                    │        │
│                              ┌─────────────────────────────────────┘        │
│                              ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │  Hook System     │                                     │
│                    │  (Pre/Post)      │                                     │
│                    └────────┬─────────┘                                     │
│                             │                                               │
│              ┌──────────────┼──────────────┐                               │
│              ▼              ▼              ▼                               │
│       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                     │
│       │   State     │ │  Context    │ │ Checkpoint  │                     │
│       │  Helpers    │ │  Helpers    │ │  Helpers    │                     │
│       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘                     │
│              │              │              │                               │
│              ▼              ▼              ▼                               │
│       ┌─────────────────────────────────────────────┐                     │
│       │           File System / Artifacts           │                     │
│       │  .claude/context/sdet-context.json          │                     │
│       │  artifacts/                                   │                     │
│       │  templates/                                   │                     │
│       └─────────────────────────────────────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Slash Commands (`.claude/commands/sdet-*.md`)

Each skill is a Markdown file with YAML frontmatter following Claude Code's skill convention:

```yaml
---
name: sdet-analyze
description: Parse requirements into structured format
arguments:
  - name: source
    description: Path to requirements
    required: false
---
```

**Key Characteristics**:
- Self-contained with all instructions embedded
- Define arguments with types, defaults, descriptions
- Reference shared helpers via `node .claude/scripts/...`
- Output structured data to shared context

### 2. Hook System (`.claude/hooks/`)

Four hooks manage cross-cutting concerns:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `sdet-state.json` | Pre/Post ToolUse | Auto-save/load skill state |
| `sdet-context.json` | Post ToolUse | Export context after each skill |
| `sdet-checkpoint.json` | Custom | Save/resume pipeline checkpoints |
| `sdet-notify.json` | Custom | Send notifications (Slack, Teams, Email) |

**Hook Configuration** (`.claude/settings.json`):
```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "sdet-*", "command": "node .claude/scripts/state-helpers.js load" }
    ],
    "PostToolUse": [
      { "matcher": "sdet-*", "command": "node .claude/scripts/state-helpers.js save" },
      { "matcher": "sdet-*", "command": "node .claude/scripts/context-helpers.js export" }
    ]
  }
}
```

### 3. Shared Context (`.claude/context/sdet-context.json`)

Single source of truth for all skills:

```json
{
  "runId": "run-20240115-abc123",
  "startedAt": "2024-01-15T10:00:00Z",
  "lastSkill": "analyze",
  "sdet": {
    "requirements": { "count": 50, "path": "..." },
    "testcases": { "count": 200, "path": "...", "template": "standard" },
    "validation": { "status": "passed", "report": {...} },
    "automation": { "files": [...], "types": ["ui", "api"], "framework": "playwright" },
    "execution": { "results": {...}, "summary": {...} },
    "results": { "updatedExcel": {...}, "defects": [...], "traceability": {...} },
    "pipeline": { "path": "...", "platform": "github-actions" },
    "run": { "id": "...", "workflow": "full", "skills": [...] }
  }
}
```

**Design Principles**:
- Namespaced keys (`sdet.<skill>.<key>`) prevent collisions
- Skill-specific context filtering via `context-helpers.js`
- Immutable history - new keys added, old preserved
- Versioned schema for forward compatibility

### 4. Helper Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `state-helpers.js` | Load/save context, get/set by path |
| `context-helpers.js` | Skill-specific import/export/filtering |
| `checkpoint-helpers.js` | Workflow checkpoint/resume with DAG |
| `notify-helpers.js` | Multi-channel notifications |
| `excel-helpers.js` | Shared Excel read/write with style preservation |
| `llm-helpers.js` | Shared LLM prompts and structured output |
| `git-helpers.js` | Git operations |
| `jira-helpers.js` / `github-helpers.js` | Integration helpers |

### 5. Template System (`templates/`)

Template-driven generation for consistency:

```
templates/
├── excel/                    # 9 Excel templates
│   ├── standard.xlsx         # General functional testing
│   ├── api.xlsx              # API testing
│   ├── security.xlsx         # Security testing
│   ├── performance.xlsx      # Performance testing
│   ├── accessibility.xlsx    # Accessibility testing
│   ├── mobile.xlsx           # Mobile testing
│   ├── exploratory.xlsx      # Exploratory testing
│   ├── compliance.xlsx       # Compliance testing
│   └── test-plan.xlsx        # Test planning
├── automation/               # 15+ framework templates
│   ├── playwright/           # POM, fixtures, config
│   ├── cypress/              # Page objects, commands
│   ├── k6/                   # Load test scripts
│   ├── pactum/               # API test patterns
│   ├── semgrep/              # Security rules
│   ├── axe/                  # Accessibility tests
│   └── pact/                 # Contract tests
├── cicd/                     # 7 platform templates
│   ├── github-actions/
│   ├── gitlab-ci/
│   ├── jenkins/
│   ├── azure-devops/
│   ├── circleci/
│   ├── bitbucket/
│   └── tekton/
├── docs/                     # Documentation templates
│   ├── test-plan.md
│   ├── test-strategy.md
│   ├── test-summary.md
│   ├── defect-report.md
│   ├── release-notes.md
│   ├── audit-evidence.md
│   └── compliance-checklist.md
└── configs/                  # Configuration templates
    ├── quality-gates.yaml
    ├── test-environments.yaml
    ├── data-masking-rules.yaml
    ├── security-rules.yaml
    └── compliance-rules.yaml
```

### 6. ML Models (`ml-models/`)

Pre-trained ONNX models for quality intelligence:

| Model | Purpose | Input | Output |
|-------|---------|-------|--------|
| `flake-detector.onnx` | Detect flaky tests | Test history, code changes | Flaky probability, classification |
| `failure-predictor.onnx` | Predict test failures | Test metadata, code churn, defects | Failure probability per test |
| `test-prioritizer.onnx` | Prioritize test execution | Risk, value, cost, coverage | Prioritized test list |
| `root-cause.onnx` | Automated RCA | Logs, traces, metrics, screenshots | Root cause classification |

**Model Serving**: ONNX Runtime Node.js - runs locally, no external API calls.

---

## Data Flow

### Core Pipeline Flow

```
Requirements (Jira/Confluence/GitHub/OpenAPI/PDF)
        │
        ▼
┌───────────────────┐
│  /sdet-analyze    │ ──▶ structured-requirements.json + traceability-map.json
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  /sdet-generate   │ ──▶ test-cases-<timestamp>.xlsx (9 templates)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  /sdet-validate   │ ──▶ validation-report.json + annotated.xlsx
└───────────────────┘
        │
        ▼ (approval gate)
┌───────────────────┐
│  /sdet-automate   │ ──▶ tests/{ui,api,security,performance,a11y,contract}/
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  /sdet-execute    │ ──▶ execution-summary.json + JUnit + Allure + artifacts
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ /sdet-analyze-res │ ──▶ updated Excel + traceability matrix + defects + trends
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  /sdet-deploy     │ ──▶ CI/CD pipeline configs (7 platforms)
└───────────────────┘
```

### Context Propagation

Each skill follows this pattern:

```javascript
// 1. Load shared context
const context = await loadContext();

// 2. Validate required keys present
await validateContext('skill-name');

// 3. Perform skill work
const result = await doWork(context.sdet.previousSkill.output);

// 4. Save skill output to context
await saveContext('skill-name', {
  key1: value1,
  key2: value2
});

// 5. Context automatically persisted via hooks
```

---

## Orchestration Architecture

### Workflow Definition

Workflows defined in `sdet-orchestrate` with DAG-based execution:

```javascript
const workflows = {
  full: {
    stages: [
      { id: 'analyze', skills: ['analyze'] },
      { id: 'generate', skills: ['generate'], dependsOn: ['analyze'] },
      { id: 'validate', skills: ['validate'], dependsOn: ['generate'], approvalGate: true },
      { id: 'automate', skills: ['automate'], dependsOn: ['validate'], parallel: true },
      { id: 'execute', skills: ['execute'], dependsOn: ['automate'] },
      { id: 'analyze-results', skills: ['analyze-results'], dependsOn: ['execute'] },
      { id: 'deploy', skills: ['deploy'], dependsOn: ['analyze-results'] }
    ]
  }
};
```

### Checkpoint/Resume

```
Checkpoint saved after each skill:
artifacts/checkpoints/
├── run-20240115-abc123/
│   ├── checkpoint-analyze.json
│   ├── checkpoint-generate.json
│   ├── checkpoint-validate.json
│   ├── checkpoint-automate.json
│   └── checkpoint-execute.json

Resume flow:
1. Load checkpoint file
2. Restore shared context
3. Determine next skill from DAG
4. Continue execution
```

### Parallel Execution

Skills with no dependencies run in parallel:

```
         validate
          /    \
       ui      api      security    performance    a11y    contract
        \    /       |          |           |         |         /
         execute ◀───┴──────────┴───────────┴─────────┴────────┘
```

---

## Configuration System

### Project Configuration (`sdet.config.yaml`)

```yaml
project:
  id: "my-project"
  name: "My Application"

skills:
  analyze:
    enabled: true
    config:
      llmProvider: "anthropic"
      model: "claude-3-5-sonnet"
  
  generate:
    enabled: true
    config:
      templatePath: "./templates/excel/standard.xlsx"
      includeNegativeTests: true

orchestration:
  defaultWorkflow: "full"
  workflows:
    - id: "full"
      stages: [...]

runtime:
  stateStore:
    type: "file"
    path: ".sdet/state.json"
  artifactStore:
    type: "local"
    path: "artifacts"
  notifications:
    slack:
      enabled: true
      webhookUrl: "${SLACK_WEBHOOK}"
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BASE_URL` | Application base URL | Yes |
| `SLACK_WEBHOOK_URL` | Slack notifications | No |
| `TEAMS_WEBHOOK_URL` | Teams notifications | No |
| `JIRA_URL` / `JIRA_TOKEN` | Jira integration | No |
| `GITHUB_TOKEN` | GitHub integration | No |

---

## Security Considerations

1. **No Secrets in Context**: Secrets stored in CI/CD secret stores, referenced via env vars
2. **Immutable Context**: Context append-only, audit trail preserved
3. **Local ML Models**: ONNX models run locally, no data leaves environment
4. **Artifact Signing**: Critical artifacts can be signed for integrity
5. **Access Control**: Skills respect CI/CD platform permissions

---

## Scalability

| Dimension | Approach |
|-----------|----------|
| **Parallel Skills** | DAG-based, max 50 concurrent |
| **Large Excel** | Streaming read/write (100k+ rows) |
| **Test Sharding** | Duration-based, count-based, file-based |
| **Artifact Storage** | Local, S3, Azure Blob, GCS pluggable |
| **Context Size** | Filtered per-skill, <1MB typical |

---

## Extension Points

1. **Custom Skills**: Add `.claude/commands/sdet-custom.md`
2. **Custom Templates**: Add to `templates/` with generator script
3. **Custom ML Models**: Add ONNX model to `ml-models/`, register in `ml-helpers.js`
4. **Custom Notifications**: Extend `notify-helpers.js` with new channel
5. **Custom CI/CD**: Add platform template to `templates/cicd/`
6. **Custom Integrations**: Add helper to `scripts/`, register in context

---

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Repo    │────▶│  npm Package    │────▶│  User Install   │
│  (Source)       │     │  @sdet/skills   │     │  ~/.claude/     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  GitHub Actions │
                    │  CI Pipeline    │
                    └─────────────────┘
```

**Installation Methods**:
1. Git clone to `~/.claude/skills/sdet`
2. Git submodule in project
3. npm package (future): `npm install @sdet/skills`
4. Claude Code skill install (when supported)

---

*Architecture Documentation v1.0*
*Last Updated: 2026-10-22*