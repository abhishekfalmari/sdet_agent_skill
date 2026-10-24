# SDET Skills - Complete Skill Reference

This document provides a comprehensive reference for all 51 SDET skills available in this skill pack.

## Table of Contents
1. [Core Pipeline (8 Skills)](#core-pipeline-8-skills)
2. [Test Design & Planning (6 Skills)](#test-design--planning-6-skills)
3. [Test Data & Environments (5 Skills)](#test-data--environments-5-skills)
4. [Specialized Testing (12 Skills)](#specialized-testing-12-skills)
5. [Quality Intelligence (6 Skills)](#quality-intelligence-6-skills)
6. [Defect & Release Management (4 Skills)](#defect--release-management-4-skills)
7. [Platform & Integration (4 Skills)](#platform--integration-4-skills)
8. [Team & Process (6 Skills)](#team--process-6-skills)
9. [Shared Context Keys](#shared-context-keys)
10. [Workflows](#workflows)

---

## Core Pipeline (8 Skills)

These 8 skills form the core end-to-end testing pipeline.

### `/sdet-analyze` - Requirement Analysis
**Description**: Parse requirements (Jira, Confluence, GitHub, OpenAPI, PDF, Markdown) into structured JSON with traceability IDs.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `source` | string | No | `./requirements` | Path to requirements folder, URL, or 'clipboard' |
| `format` | string | No | `json` | Output format (json, gherkin, markdown) |

**Outputs**:
- `artifacts/requirements/structured-requirements.json`
- `artifacts/requirements/traceability-map.json`

**Context Keys**: `sdet.requirements.count`, `sdet.requirements.path`, `sdet.traceability.path`

### `/sdet-generate` - Test Case Generation (Excel)
**Description**: Generate test cases in standard Excel template from structured requirements.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `template` | string | No | `standard` | Template type (standard, api, security, performance, accessibility, mobile, exploratory, compliance, test-plan) |
| `includeNegative` | boolean | No | `true` | Include negative test cases |
| `includeBoundary` | boolean | No | `true` | Include boundary value analysis test cases |

**Outputs**:
- `artifacts/test-cases/test-cases-<timestamp>.xlsx`

**Context Keys**: `sdet.testcases.count`, `sdet.testcases.path`, `sdet.testcases.template`

### `/sdet-validate` - Test Case Validation
**Description**: Validate Excel test cases for completeness, correctness, and traceability.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `file` | string | No | (from context) | Path to test case Excel file |
| `strict` | boolean | No | `false` | Strict validation mode |

**Outputs**:
- `artifacts/validation/validation-report-<timestamp>.json`
- `artifacts/validation/test-cases-annotated-<timestamp>.xlsx`

**Context Keys**: `sdet.validation.status`, `sdet.validation.report.path`, `sdet.validation.annotated.path`

### `/sdet-automate` - Automation Generation
**Description**: Generate automation code from validated Excel test cases.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `all` | Automation type (ui, api, security, performance, accessibility, contract, all) |
| `framework` | string | No | `playwright` | Framework (playwright, cypress, appium, detox, maestro, pactum, k6, semgrep, zap, trivy, axe, pact) |
| `pattern` | string | No | `pom` | Code pattern (pom, screenplay, functional) |

**Outputs**:
- `tests/ui/`, `tests/api/`, `tests/security/`, `tests/performance/`, `tests/accessibility/`, `tests/contract/`

**Context Keys**: `sdet.automation.files[]`, `sdet.automation.types[]`, `sdet.automation.framework`

### `/sdet-execute` - Test Execution
**Description**: Execute automation tests with orchestration (parallel, sharding, retry, flake detection).

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `all` | Test type (ui, api, security, performance, accessibility, contract, all) |
| `parallel` | number | No | `4` | Max parallel workers |
| `retry` | number | No | `2` | Retry count for flaky tests |
| `shard` | string | No | `duration` | Shard strategy (duration, count, file, size) |
| `timeout` | number | No | `60` | Global timeout in minutes |
| `environment` | string | No | `local` | Target environment (local, dev, staging, production) |
| `headed` | boolean | No | `false` | Run UI tests in headed mode |

**Outputs**:
- `artifacts/results/<type>/`
- `artifacts/results/execution-summary-<timestamp>.json`

**Context Keys**: `sdet.execution.results.path`, `sdet.execution.summary`, `sdet.execution.artifacts[]`, `sdet.execution.flakyTests[]`

### `/sdet-analyze-results` - Post-Execution Analysis
**Description**: Analyze results, update test cases, correlate defects, update traceability.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `createDefects` | boolean | No | `false` | Auto-create defects in Jira/GitHub |
| `updateExcel` | boolean | No | `true` | Update original Excel with pass/fail |
| `correlateDefects` | boolean | No | `true` | Correlate failures to requirements |
| `generateTrends` | boolean | No | `true` | Generate trend analysis |

**Outputs**:
- `artifacts/test-cases/test-cases-results-<timestamp>.xlsx`
- `artifacts/traceability/traceability-matrix-<timestamp>.xlsx`
- `artifacts/trends/history.json`
- `artifacts/analysis/analysis-report-<timestamp>.json`

**Context Keys**: `sdet.results.updatedExcel.path`, `sdet.results.defects[]`, `sdet.results.traceability.path`, `sdet.results.trends.path`, `sdet.results.analysisReport.path`

### `/sdet-deploy` - CI/CD Pipeline Generation
**Description**: Generate CI/CD pipeline configuration for the project.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `platform` | string | No | `github-actions` | CI/CD platform (github-actions, gitlab-ci, jenkins, azure-devops, circleci, bitbucket, tekton) |
| `qualityGates` | boolean | No | `true` | Enable quality gates |
| `environments` | string | No | `dev,staging` | Comma-separated environments |
| `matrix` | boolean | No | `true` | Enable matrix testing |

**Outputs**:
- `.github/workflows/sdet-pipeline.yml` (GitHub Actions)
- `.gitlab-ci.yml` (GitLab CI)
- `Jenkinsfile` (Jenkins)
- `azure-pipelines.yml` (Azure DevOps)

**Context Keys**: `sdet.pipeline.path`, `sdet.pipeline.platform`, `sdet.pipeline.stages[]`, `sdet.pipeline.qualityGates`

### `/sdet-orchestrate` - Master Orchestrator
**Description**: Run the full SDET pipeline end-to-end with monitoring, checkpoints, and human gates.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `workflow` | string | No | `full` | Workflow (full, quick, ci, security, performance) |
| `autoApprove` | boolean | No | `false` | Skip human approval gates |
| `continueOnFailure` | boolean | No | `false` | Continue pipeline on skill failure |
| `resume` | string | No | - | Resume from checkpoint (runId) |
| `notify` | boolean | No | `true` | Send notifications |

**Outputs**:
- `artifacts/orchestration/summary-<runId>.json`
- Checkpoints at `artifacts/checkpoints/`

**Context Keys**: `sdet.run.id`, `sdet.run.workflow`, `sdet.run.status`, `sdet.run.startedAt`, `sdet.run.completedAt`, `sdet.run.checkpoint`, `sdet.run.skills[]`

---

## Test Design & Planning (6 Skills)

### `/sdet-plan` - Test Plan & Strategy Generation
**Description**: Generate comprehensive test plan/strategy documents.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `master` | Plan type (master, phase, release, sprint, hotfix) |
| `standard` | string | No | `ieee829` | Standard (ieee829, iso29119, custom) |

**Context Keys**: `sdet.plan.path`, `sdet.plan.type`, `sdet.plan.risks[]`

### `/sdet-estimate` - Test Effort Estimation
**Description**: Estimate test effort using multiple techniques.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `method` | string | No | `three-point` | Method (function-point, use-case, story-point, t-shirt, expert, three-point, ml) |
| `baseline` | string | No | - | Path to historical data |

**Context Keys**: `sdet.estimate.hours`, `sdet.estimate.breakdown`, `sdet.estimate.confidence`

### `/sdet-prioritize` - Risk-Based Test Prioritization
**Description**: Prioritize tests by risk, value, and execution cost.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `algorithm` | string | No | `hybrid` | Algorithm (risk, value, cost, hybrid, ml) |
| `budget` | string | No | - | Execution budget (time or test count) |

**Context Keys**: `sdet.prioritize.ordered[]`, `sdet.prioritize.skipped[]`, `sdet.prioritize.rationale`

### `/sdet-coverage` - Coverage Analysis & Gap Detection
**Description**: Analyze test coverage across code, requirements, risks.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `all` | Coverage type (code, requirement, risk, branch, path, mutation, all) |
| `threshold` | string | No | - | Minimum thresholds (JSON) |

**Context Keys**: `sdet.coverage.code`, `sdet.coverage.requirement`, `sdet.coverage.gaps[]`

### `/sdet-trace` - Bidirectional Traceability Matrix
**Description**: Generate and maintain full bidirectional traceability.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `format` | string | No | `matrix` | Format (matrix, graph, json, excel, confluence, jira) |
| `direction` | string | No | `both` | Direction (forward, backward, both, impact) |

**Context Keys**: `sdet.trace.matrix.path`, `sdet.trace.graph.path`, `sdet.trace.orphans[]`

### `/sdet-review` - Test Case Peer Review Workflow
**Description**: Manage test case peer review process.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `mode` | string | No | `async` | Mode (async, sync, gated, checklist) |
| `reviewers` | string | No | `auto` | Reviewers (comma-separated or 'auto') |

**Context Keys**: `sdet.review.status`, `sdet.review.comments[]`, `sdet.review.approved`

---

## Test Data & Environments (5 Skills)

### `/sdet-data` - Test Data Generation & Management
**Description**: Generate, manage, and version test data.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `strategy` | string | No | `hybrid` | Strategy (synthetic, subset, clone, mask, fixture, hybrid) |
| `volume` | string | No | `medium` | Volume (small, medium, large, production-scale) |

**Context Keys**: `sdet.data.paths[]`, `sdet.data.schemas[]`, `sdet.data.version`

### `/sdet-mask` - Data Masking & Privacy Compliance
**Description**: Mask sensitive data for test environments.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `regulations` | string | No | `gdpr` | Regulations (gdpr, hipaa, pci, ccpa, sox, custom) |
| `mode` | string | No | `deterministic` | Mode (deterministic, random, format-preserving, encryption) |

**Context Keys**: `sdet.mask.path`, `sdet.mask.audit.path`, `sdet.mask.rules.applied[]`

### `/sdet-mock` - Service Virtualization / Mock Servers
**Description**: Generate and deploy service virtualization / mock servers.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `tool` | string | No | `wiremock` | Tool (wiremock, mockserver, prism, localstack, testcontainers, custom) |
| `mode` | string | No | `hybrid` | Mode (record, generate, hybrid, proxy) |

**Context Keys**: `sdet.mock.services[]`, `sdet.mock.configs[]`, `sdet.mock.endpoints[]`

### `/sdet-env` - Test Environment Provisioning
**Description**: Provision and manage test environments.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `target` | string | No | `k8s` | Target (k8s, docker-compose, vm, bare-metal, cloud, hybrid) |
| `action` | string | No | `create` | Action (create, update, destroy, validate, snapshot, promote) |

**Context Keys**: `sdet.env.url`, `sdet.env.credentials`, `sdet.env.status`, `sdet.env.spec`

### `/sdet-seed` - Database Seeding & State Management
**Description**: Seed databases and manage test state.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `db` | string | No | `all` | Database (postgres, mysql, sqlserver, oracle, mongodb, dynamodb, redis, all) |
| `strategy` | string | No | `transaction-rollback` | Strategy (truncate, transaction-rollback, snapshot, flyway, liquibase) |

**Context Keys**: `sdet.seed.scripts[]`, `sdet.seed.status`, `sdet.seed.verification[]`

---

## Specialized Testing (12 Skills)

### `/sdet-ui` - Visual Regression Testing
**Description**: Visual regression testing across browsers/devices.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `tool` | string | No | `playwright-visual` | Tool (percy, chromatic, playwright-visual, applitools, backstop) |
| `baseline` | string | No | `main` | Baseline branch/tag |

**Context Keys**: `sdet.ui.results.path`, `sdet.ui.diffs[]`, `sdet.ui.approved[]`

### `/sdet-mobile` - Mobile Testing
**Description**: Mobile test automation (native, hybrid, PWA).

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `platform` | string | No | `both` | Platform (ios, android, both) |
| `framework` | string | No | `appium` | Framework (appium, detox, xcuitest, espresso, maestro) |
| `device` | string | No | `simulator` | Device (simulator, real-device, cloud, all) |

**Context Keys**: `sdet.mobile.tests[]`, `sdet.mobile.devices[]`, `sdet.mobile.framework`

### `/sdet-api-fuzz` - API Fuzzing & Robustness
**Description**: API fuzzing for robustness and security.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `tool` | string | No | `schemathesis` | Tool (restler, schemathesis, fuzzapi, custom) |
| `mode` | string | No | `generative` | Mode (structure, grammar, mutation, generative, ml) |

**Context Keys**: `sdet.api-fuzz.findings[]`, `sdet.api-fuzz.crashes[]`, `sdet.api-fuzz.coverage`

### `/sdet-contract` - Consumer-Driven Contract Testing
**Description**: Consumer-driven contract testing (Pact, Spring Cloud Contract).

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `framework` | string | No | `pact` | Framework (pact, spring-cloud-contract, pactflow, custom) |
| `role` | string | No | `both` | Role (consumer, provider, both, broker) |

**Context Keys**: `sdet.contract.consumer[]`, `sdet.contract.provider[]`, `sdet.contract.matrix`

### `/sdet-chaos` - Chaos Engineering Experiments
**Description**: Design and execute chaos engineering experiments.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `tool` | string | No | `litmus` | Tool (litmus, gremlin, chaos-mesh, k6-chaos, custom) |
| `scope` | string | No | `all` | Scope (pod, node, network, dns, time, io, cpu, memory, all) |

**Context Keys**: `sdet.chaos.experiments[]`, `sdet.chaos.results[]`, `sdet.chaos.improvements[]`

### `/sdet-load` - Load/Stress/Soak/Spike Testing
**Description**: Performance load testing.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `load` | Type (load, stress, soak, spike, breakpoint, scalability) |
| `tool` | string | No | `k6` | Tool (k6, gatling, jmeter, locust, vegeta, artillery) |

**Context Keys**: `sdet.load.report.path`, `sdet.load.bottlenecks[]`, `sdet.load.capacity`

### `/sdet-perf-profile` - Performance Profiling & Analysis
**Description**: Deep performance profiling and root cause analysis.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `profiler` | string | No | `async-profiler` | Profiler (py-spy, perf, async-profiler, datadog, newrelic, custom) |
| `target` | string | No | `all` | Target (cpu, memory, gc, lock, io, allocation, all) |

**Context Keys**: `sdet.perf-profile.bottlenecks[]`, `sdet.perf-profile.flamegraphs[]`, `sdet.perf-profile.recommendations[]`

### `/sdet-security` - Comprehensive Security Testing
**Description**: Security testing (SAST, DAST, IAST, SCA, secrets, compliance).

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `all` | Type (sast, dast, iast, sca, secrets, container, iac, all) |
| `standard` | string | No | `owasp-top10` | Standard (owasp-top10, owasp-api, cwe, sans, nist, custom) |

**Context Keys**: `sdet.security.findings[]`, `sdet.security.by-severity`, `sdet.security.remediation[]`

### `/sdet-accessibility` - Accessibility Testing
**Description**: Accessibility testing (WCAG 2.1/2.2 AA/AAA).

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `level` | string | No | `AA` | WCAG level (A, AA, AAA) |
| `tool` | string | No | `axe-core` | Tool (axe-core, pa11y, lighthouse, tenon, custom) |

**Context Keys**: `sdet.accessibility.violations[]`, `sdet.accessibility.vpat.path`, `sdet.accessibility.score`

### `/sdet-compliance` - Regulatory Compliance Testing
**Description**: Regulatory compliance testing.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `regulation` | string | No | `gdpr` | Regulation (gdpr, hipaa, pci-dss, sox, fda-21cfr11, iso27001, soc2, custom) |
| `evidence` | boolean | No | `true` | Generate audit evidence |

**Context Keys**: `sdet.compliance.report.path`, `sdet.compliance.evidence.path`, `sdet.compliance.gaps[]`

### `/sdet-explore` - Exploratory Testing Session Management
**Description**: Manage exploratory testing sessions.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `charter` | string | Yes | - | Session charter |
| `technique` | string | No | `sbet` | Technique (tour, mind-map, sbet, freestyle) |

**Context Keys**: `sdet.explore.sessions[]`, `sdet.explore.bugs[]`, `sdet.explore.coverage`

### `/sdet-usability` - Usability Testing Coordination
**Description**: Plan, recruit, conduct, and analyze usability tests.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `method` | string | No | `remote-unmoderated` | Method (moderated, unmoderated, remote, in-person, guerrilla, five-second) |
| `participants` | number | No | `5` | Number of participants |

**Context Keys**: `sdet.usability.metrics`, `sdet.usability.findings[]`, `sdet.usability.recordings[]`

---

## Quality Intelligence (6 Skills)

### `/sdet-flake` - Flaky Test Detection & Quarantine
**Description**: Detect, quarantine, and auto-fix flaky tests.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `window` | number | No | `30` | History window (days) |
| `action` | string | No | `all` | Action (detect, quarantine, fix, report, all) |

**Context Keys**: `sdet.flake.flaky[]`, `sdet.flake.quarantined[]`, `sdet.flake.fix-suggestions[]`

### `/sdet-mutate` - Mutation Testing
**Description**: Mutation testing to measure test effectiveness.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `tool` | string | No | `stryker` | Tool (stryker, pitest, mutmut, infection, mull) |
| `mutators` | string | No | `defaults` | Mutators (defaults, all, specific list) |

**Context Keys**: `sdet.mutate.score`, `sdet.mutate.survivors[]`, `sdet.mutate.improvements[]`

### `/sdet-predict` - ML-Based Failure Prediction
**Description**: Predict test failures and prioritize using ML.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `model` | string | No | `failure-predictor` | Model (failure-predictor, test-prioritizer, custom) |
| `horizon` | string | No | `next-run` | Horizon (next-run, next-day, next-week, next-sprint) |

**Context Keys**: `sdet.predict.probabilities[]`, `sdet.predict.recommended-subset[]`, `sdet.predict.risk-heatmap`

### `/sdet-autoheal` - Self-Healing Tests
**Description**: Self-healing selectors and test auto-repair.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `target` | string | No | `all` | Target (selectors, assertions, waits, data, all) |
| `mode` | string | No | `suggest` | Mode (suggest, auto-apply, dry-run) |

**Context Keys**: `sdet.autoheal.fixed[]`, `sdet.autoheal.confidence[]`, `sdet.autoheal.prs[]`

### `/sdet-rootcause` - Automated Root Cause Analysis
**Description**: Automated root cause analysis from test failures.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `source` | string | No | `all` | Source (logs, traces, metrics, screenshots, all) |
| `depth` | string | No | `root` | Depth (symptom, contributing, root, systemic) |

**Context Keys**: `sdet.rootcause.report.path`, `sdet.rootcause.cause`, `sdet.rootcause.fix[]`

### `/sdet-insights` - Quality Dashboard & Trends
**Description**: Generate quality dashboards, trends, and executive reports.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `audience` | string | No | `team` | Audience (executive, manager, team, developer, auditor) |
| `period` | string | No | `sprint` | Period (daily, weekly, sprint, monthly, quarterly, release) |

**Context Keys**: `sdet.insights.dashboard.url`, `sdet.insights.kpis`, `sdet.insights.alerts[]`

---

## Defect & Release Management (4 Skills)

### `/sdet-defect` - Defect Lifecycle Management
**Description**: End-to-end defect management.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `system` | string | No | `jira` | System (jira, github, gitlab, azure, rally, custom) |
| `action` | string | No | `create` | Action (create, update, link, verify, close, bulk, report) |

**Context Keys**: `sdet.defect.created[]`, `sdet.defect.verified[]`, `sdet.defect.report.path`

### `/sdet-triage` - Automated Defect Triage
**Description**: Automated defect triage and routing.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `model` | string | No | `hybrid` | Model (rule-based, ml, hybrid) |
| `auto-assign` | boolean | No | `true` | Auto-assign to team/owner |

**Context Keys**: `sdet.triage.decisions[]`, `sdet.triage.assignments[]`, `sdet.triage.duplicates[]`

### `/sdet-release` - Release Validation & Go/No-Go
**Description**: Release validation and go/no-go decision gate.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `criteria` | string | No | - | Criteria file |
| `environment` | string | No | `staging` | Environment (staging, preprod, production) |

**Context Keys**: `sdet.release.decision`, `sdet.release.rationale`, `sdet.release.conditions[]`

### `/sdet-rollback` - Automated Rollback Triggers
**Description**: Configure and execute automated rollbacks.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `trigger` | string | No | `slo-breach` | Trigger (slo-breach, error-budget, manual, health-check, anomaly) |
| `strategy` | string | No | `blue-green` | Strategy (blue-green, canary, rolling, feature-flag) |

**Context Keys**: `sdet.rollback.config`, `sdet.rollback.triggers[]`, `sdet.rollback.last-executed`

---

## Platform & Integration (4 Skills)

### `/sdet-service-map` - Service Topology & Impact Analysis
**Description**: Discover service topology and test impact analysis.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `source` | string | No | `traces` | Source (traces, mesh, k8s, api-gateway, manual) |
| `action` | string | No | `all` | Action (discover, map, impact, visualize, monitor) |

**Context Keys**: `sdet.service-map.graph`, `sdet.service-map.impact[]`, `sdet.service-map.visualization`

### `/sdet-migrate` - Test Migration Between Frameworks
**Description**: Migrate tests between frameworks.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `from` | string | Yes | - | Source framework |
| `to` | string | Yes | - | Target framework |
| `mode` | string | No | `translate` | Mode (translate, rewrite, hybrid, validate) |

**Context Keys**: `sdet.migrate.files[]`, `sdet.migrate.report.path`, `sdet.migrate.unverified[]`

### `/sdet-backport` - Backport Tests to Older Versions
**Description**: Backport tests to maintenance branches.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `branches` | string | Yes | - | Target branches (comma-separated) |
| `strategy` | string | No | `cherry-pick` | Strategy (cherry-pick, rewrite, adapter, conditional) |

**Context Keys**: `sdet.backport.prs[]`, `sdet.backport.validated[]`, `sdet.backport.failed[]`

### `/sdet-monitor` - Synthetic Monitoring from Tests
**Description**: Convert test cases to synthetic monitoring checks.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `platform` | string | No | `datadog` | Platform (datadog, newrelic, grafana, pingdom, checkly, custom) |
| `frequency` | string | No | `5m` | Frequency (1m, 5m, 15m, 1h) |

**Context Keys**: `sdet.monitor.checks[]`, `sdet.monitor.dashboards[]`, `sdet.monitor.alerts[]`

---

## Team & Process (6 Skills)

### `/sdet-dashboard` - Living Documentation & Dashboards
**Description**: Generate living documentation from tests.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `format` | string | No | `html` | Format (html, confluence, notion, gitbook, markdown, allure) |
| `include` | string | No | `all` | Sections (requirements, tests, results, coverage, defects, all) |

**Context Keys**: `sdet.dashboard.url`, `sdet.dashboard.version`, `sdet.dashboard.sections[]`

### `/sdet-retro` - Sprint Retrospective Analytics
**Description**: Data-driven sprint retrospective for quality.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `sprint` | string | No | `current` | Sprint ID or 'current' |
| `format` | string | No | `report` | Format (report, slides, miro, mural, action-items) |

**Context Keys**: `sdet.retro.findings[]`, `sdet.retro.actions[]`, `sdet.retro.metrics`

### `/sdet-onboard` - Team Onboarding & Knowledge Transfer
**Description**: Generate onboarding guides and knowledge base.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `role` | string | No | `new-hire` | Role (sdet, qa, dev, pm, new-hire) |
| `depth` | string | No | `hands-on` | Depth (overview, deep-dive, hands-on, reference) |

**Context Keys**: `sdet.onboard.portal.url`, `sdet.onboard.modules[]`, `sdet.onboard.assessment`

### `/sdet-governance` - Test Governance & Policy Enforcement
**Description**: Enforce test policies, standards, and governance.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `policy` | string | No | `default` | Policy file or 'default' |
| `mode` | string | No | `warning` | Mode (advisory, warning, blocking, audit) |

**Context Keys**: `sdet.governance.violations[]`, `sdet.governance.score`, `sdet.governance.fix-prs[]`

### `/sdet-audit` - Audit Evidence Packaging
**Description**: Package audit evidence for compliance audits.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `standard` | string | No | `soc2` | Standard (sox, iso27001, soc2, hipaa, gdpr, fda, custom) |
| `period` | string | No | `quarter` | Period (quarter, year, custom range) |

**Context Keys**: `sdet.audit.package.path`, `sdet.audit.matrix.path`, `sdet.audit.controls[]`

### `/sdet-report` - Executive & Test Summary Reports
**Description**: Generate executive and technical test reports.

**Arguments**:
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | No | `executive` | Type (executive, technical, release, sprint, incident, custom) |
| `format` | string | No | `pdf` | Format (pdf, html, pptx, docx, markdown, confluence) |

**Context Keys**: `sdet.report.path`, `sdet.report.type`, `sdet.report.recipients[]`

---

## Shared Context Keys

All skills communicate through a shared context stored in `.claude/context/sdet-context.json`:

```json
{
  "runId": "run-20240115-abc123",
  "startedAt": "2024-01-15T10:00:00Z",
  "lastSkill": "analyze",
  "updatedAt": "2024-01-15T10:00:30Z",
  "sdet": {
    "requirements": {
      "count": 50,
      "path": "artifacts/requirements/structured-requirements.json"
    },
    "testcases": {
      "count": 200,
      "path": "artifacts/test-cases/test-cases-standard.xlsx",
      "template": "standard"
    },
    "validation": {
      "status": "passed",
      "report": { "path": "artifacts/validation/validation-report.json" },
      "annotated": { "path": "artifacts/validation/test-cases-annotated.xlsx" }
    },
    "automation": {
      "files": ["tests/ui/login.spec.ts", "tests/api/users.spec.ts"],
      "types": ["ui", "api"],
      "framework": "playwright"
    },
    "execution": {
      "results": { "path": "artifacts/results/execution-summary.json" },
      "summary": { "passed": 180, "failed": 15, "skipped": 5, "flaky": 3, "duration": 420 },
      "artifacts": ["artifacts/results/ui/junit.xml", "artifacts/results/api/junit.xml"],
      "flakyTests": ["TC-045", "TC-078"]
    },
    "results": {
      "updatedExcel": { "path": "artifacts/test-cases/test-cases-results-20240115.xlsx" },
      "defects": [{ "id": "DEF-123", "testCaseId": "TC-045", "severity": "High" }],
      "traceability": { "path": "artifacts/traceability/traceability-matrix.xlsx" },
      "trends": { "path": "artifacts/trends/history.json" },
      "analysisReport": { "path": "artifacts/analysis/analysis-report.json" }
    },
    "pipeline": {
      "path": ".github/workflows/sdet-pipeline.yml",
      "platform": "github-actions",
      "stages": ["analyze", "generate", "validate", "automate", "execute", "analyze-results"],
      "qualityGates": true
    },
    "run": {
      "id": "run-20240115-abc123",
      "workflow": "full",
      "status": "completed",
      "startedAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:45:00Z",
      "checkpoint": "analyze-results",
      "skills": [
        { "skill": "analyze", "status": "completed", "duration": 30 },
        { "skill": "generate", "status": "completed", "duration": 45 },
        { "skill": "validate", "status": "completed", "duration": 20 },
        { "skill": "automate", "status": "completed", "duration": 120 },
        { "skill": "execute", "status": "completed", "duration": 1800 },
        { "skill": "analyze-results", "status": "completed", "duration": 60 }
      ]
    }
  }
}
```

---

## Workflows

### `full` - Complete Pipeline
```
analyze → generate → validate → [approval] → automate → execute → analyze-results → quality-gates → deploy
```
**Use Case**: Release validation, full regression

### `quick` - Fast Feedback
```
generate → validate → automate(ui,api) → execute → analyze-results
```
**Use Case**: Daily development, PR validation

### `ci` - CI/CD Pipeline
```
validate → automate → execute → analyze-results
```
**Use Case**: Continuous integration (assumes test cases exist)

### `security` - Security-Focused
```
analyze → generate(security) → validate → automate(security) → execute → analyze-results
```
**Use Case**: Security testing, compliance validation

### `performance` - Performance-Focused
```
analyze → generate(performance) → validate → automate(performance) → execute → analyze-results
```
**Use Case**: Load/stress testing, performance regression

---

## Skill Composition Examples

### Run full pipeline with auto-approval
```bash
/sdet-orchestrate --workflow full --autoApprove true
```

### Run security workflow
```bash
/sdet-orchestrate --workflow security
```

### Resume from checkpoint
```bash
/sdet-orchestrate --resume run-20240115-abc123
```

### Run individual skills
```bash
/sdet-analyze --source ./requirements
/sdet-generate --template security
/sdet-validate --strict true
/sdet-automate --type api --framework pactum
/sdet-execute --type api --parallel 8
/sdet-analyze-results --createDefects true
/sdet-deploy --platform gitlab-ci
```

---

## Extending with Custom Skills

Create a new skill file at `.claude/commands/sdet-custom.md`:

```markdown
---
name: sdet-custom
description: Your custom SDET skill
arguments:
  - name: param
    description: Description
    required: false
---

# SDET Custom Skill

## Context
You are an SDET specialist. Your custom description.

## Instructions
1. Load context: `node .claude/scripts/state-helpers.js load`
2. Do your work
3. Save context: `node .claude/scripts/state-helpers.js save sdet-custom {...}`
```

---

*Generated by SDET Skills - Complete Skill Reference*
*Last Updated: 2026-10-22*