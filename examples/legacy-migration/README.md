# Legacy Migration Example Project

## Overview
Complete migration from a 15-year-old PHP/MySQL monolith to cloud-native microservices using Strangler Fig pattern with zero-downtime cutover.

## Architecture

### Current State (Legacy)
```
┌─────────────────────────────────────────────────────────────┐
│                    LEGACY MONOLITH                          │
│  PHP 5.6 / Laravel 4.2  │  MySQL 5.7 (2TB)  │  On-prem VMs │
│  ~500K lines            │  500+ tables      │  6 app + 2 DB │
│  jQuery + Blade         │  No FKs, SPs      │  Manual deploy│
└─────────────────────────────────────────────────────────────┘
```

### Target State (New)
```
┌─────────────────────────────────────────────────────────────┐
│                     NEW PLATFORM                            │
│  Kubernetes (EKS/GKE)  │  PostgreSQL + Redis  │  GitOps    │
│  Istio Service Mesh    │  Kafka (CDC)         │  ArgoCD    │
│  Go/Node/Python/Rust   │  Elasticsearch       │  Observability│
└─────────────────────────────────────────────────────────────┘
```

### Migration Pattern: Strangler Fig
```
                    ┌─────────────┐
                    │   TRAFFIC   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   LEGACY    │  ◀─────▶  │    NEW      │
       │  (PHP/MYSQL)│  DUAL    │  (K8S/MICRO)│
       └─────────────┘  WRITE    └─────────────┘
              ▲                         ▲
              │    CDC (Debezium)       │
              └────────────┬────────────┘
                           ▼
                    ┌─────────────┐
                    │ POSTGRESQL  │
                    │  (NEW DB)   │
                    └─────────────┘
```

## Repository Structure
```
legacy-migration/
├── legacy/                    # Legacy system (reference)
│   ├── src/                   # PHP application
│   ├── database/              # MySQL schema, migrations
│   ├── docker/                # Legacy Dockerfile (for testing)
│   └── docs/                  # Legacy architecture docs
├── new-platform/              # New microservices platform
│   ├── api-gateway/           # Kong/Envoy configuration
│   ├── catalog-service/       # Go + gRPC + PostgreSQL + ES
│   ├── user-service/          # Go + gRPC + PostgreSQL
│   ├── cart-service/          # Node.js + gRPC + Redis
│   ├── order-service/         # Python + gRPC + PostgreSQL
│   ├── payment-service/       # Rust + gRPC + PostgreSQL
│   ├── admin-dashboard/       # React + TypeScript
│   ├── shared/                # Protobuf, events, libraries
│   └── infra/                 # Kubernetes, Terraform, Helm
├── migration/                 # Migration-specific tooling
│   ├── cdc/                   # Debezium connectors, Kafka Connect
│   ├── dual-write/            # Dual-write library + tests
│   ├── shadow/                # Shadow traffic framework
│   ├── validation/            # Data reconciliation tools
│   ├── feature-flags/         # LaunchDarkly/Unleash config
│   ├── cutover/               # Cutover runbooks, scripts
│   └── rollback/              # Rollback procedures, automation
├── tests/
│   ├── contract/              # Pact contract tests (legacy↔new)
│   ├── shadow/                # Shadow traffic comparison tests
│   ├── data-validation/       # Reconciliation, checksum tests
│   ├── chaos/                 # LitmusChaos migration experiments
│   ├── performance/           # k6 load tests (2x peak)
│   ├── cutover-rehearsal/     # Monthly cutover dry runs
│   └── uat/                   # Beta user acceptance tests
├── docs/
│   ├── architecture/          # ADRs, migration decisions
│   ├── runbooks/              # Per-service migration runbooks
│   ├── cutover/               # Cutover checklist, procedures
│   └── compliance/            # PCI, GDPR, SOX evidence
├── .github/workflows/         # CI/CD pipelines
├── docker-compose.yml         # Local development stack
├── kind-config.yaml           # Kind cluster for testing
└── migration-plan.yaml        # Master migration plan
```

## Requirements (requirements/)
See `requirements/` folder for:
- `functional.md` - 25 user stories across 4 phases + cross-cutting
- `non-functional.md` - Performance, security, data migration, reliability requirements

## Quick Start

### Prerequisites
```bash
# Tools needed
# - Docker + Docker Compose
# - Kind (Kubernetes in Docker)
# - kubectl, helm, terraform
# - Debezium/Kafka Connect (for CDC)
# - LaunchDarkly/Unleash account (feature flags)
```

### 1. Local Development Stack
```bash
# Start legacy + new platform + migration tooling
docker-compose -f docker-compose.yml -f docker-compose.migration.yml up -d

# Verify legacy API
curl http://localhost:8080/api/products

# Verify new services
curl http://localhost:8000/health  # API Gateway
```

### 2. Kind Cluster (Full Integration Test)
```bash
# Create cluster with migration config
kind create cluster --config kind-config.yaml

# Deploy new platform
kubectl apply -k new-platform/infra/kubernetes/overlays/dev

# Deploy CDC pipeline
kubectl apply -f migration/cdc/kubernetes/

# Run contract tests
/sdet-execute --type contract --env kind
```

### 3. Run Migration SDET Pipeline

#### Phase 1: Foundation
```bash
# Analyze migration requirements
/sdet-analyze --source ./requirements --domain foundation --format json

# Generate migration test cases
/sdet-generate --template migration --includeShadow --includeContract --includeChaos

# Validate
/sdet-validate --strict

# Generate automation
/sdet-automate --type contract,shadow,chaos --framework pact,k6,litmus --migration-phase foundation

# Execute foundation tests
/sdet-execute --type contract,shadow --env kind --duration 30m
```

#### Phase 2: Core Domains (Per Service)
```bash
# Catalog service migration
/sdet-orchestrate --workflow migration-service --service catalog --autoApprove

# User service migration
/sdet-orchestrate --workflow migration-service --service user --autoApprove

# Cart service migration
/sdet-orchestrate --workflow migration-service --service cart --autoApprove

# Order service migration
/sdet-orchestrate --workflow migration-service --service order --autoApprove

# Payment service migration (PCI)
/sdet-orchestrate --workflow migration-service --service payment --manualApproval
```

#### Phase 3: Supporting Features
```bash
/sdet-orchestrate --workflow migration-supporting --autoApprove
```

#### Phase 4: Cutover
```bash
# Cutover rehearsal (monthly)
/sdet-execute --type cutover-rehearsal --env staging

# Actual cutover
/sdet-orchestrate --workflow migration-cutover --manualApproval
```

## Key Migration Test Scenarios

### 1. Contract Tests (Pact)
- Legacy API as provider, New services as consumers
- New services as providers, Legacy as consumer (dual-write)
- Versioned contracts in Pact Broker
- `can-i-deploy` gate for each service

### 2. Shadow Traffic Testing
```bash
# Mirror 100% production to new services
/sdet-execute --type shadow --traffic 100% --duration 2w --compare

# Metrics collected:
# - Response diff rate (target: < 0.1%)
# - Latency comparison (new vs legacy)
# - Error rate comparison
# - Business metric parity (orders, revenue)
```

### 3. Data Validation
```bash
# Continuous reconciliation
/sdet-execute --type data-validation --schedule "*/30 * * * *"

# Pre-cutover full validation
/sdet-execute --type data-validation --full --tables all

# Checks:
# - Row counts per table
# - Checksums (MD5 per partition)
# - Business metrics (revenue, orders, users)
# - Referential integrity
```

### 4. Chaos Engineering During Migration
```bash
# Test resilience during dual-run
/sdet-execute --type chaos --migration-phase dual-run --experiments all

# Experiments:
# - Legacy DB failure (new serves from cache)
# - New service failure (fallback to legacy)
# - CDC pipeline failure (lag alerting)
# - Network partition (legacy ↔ new)
# - Feature flag service failure
```

### 5. Performance Testing
```bash
# New system at 2x peak
/sdet-execute --type performance --vus 10000 --duration 4h --thresholds 2x

# Black Friday simulation
/sdet-execute --type performance --scenario black-friday --vus 50000 --duration 30m
```

### 6. Cutover Rehearsal (Monthly)
```bash
# Full dry run in staging
/sdet-orchestrate --workflow migration-cutover-rehearsal

# Steps:
# 1. Freeze legacy writes
# 2. Final CDC sync
# 3. DNS switch (staging domain)
# 4. Smoke tests
# 5. Rollback
# 6. Measure: < 30 min total
```

## Migration Workflows

### Service Migration Workflow
```yaml
# .github/workflows/migration-service.yml
name: Migrate Service
on:
  workflow_dispatch:
    inputs:
      service:
        type: choice
        options: [catalog, user, cart, order, payment]
      phase:
        type: choice
        options: [shadow, canary, cutover]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - run: /sdet-execute --type contract --service ${{ inputs.service }}

  shadow-test:
    needs: contract-tests
    if: inputs.phase == 'shadow'
    runs-on: ubuntu-latest
    steps:
      - run: /sdet-execute --type shadow --service ${{ inputs.service }} --duration 2w

  canary-deploy:
    needs: shadow-test
    if: inputs.phase == 'canary'
    runs-on: ubuntu-latest
    steps:
      - run: /sdet-deploy --service ${{ inputs.service }} --strategy canary --percentage 5

  cutover:
    needs: canary-deploy
    if: inputs.phase == 'cutover'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: /sdet-orchestrate --workflow migration-cutover --service ${{ inputs.service }}
```

### Master Migration Orchestration
```bash
# Full 18-month migration (simulated in days for testing)
/sdet-orchestrate --workflow migration-full --timeline accelerated

# Phases:
# 1. foundation (3 months → 30 min)
# 2. catalog (2 months → 20 min)
# 3. user (1.5 months → 15 min)
# 4. cart (1 month → 10 min)
# 5. order (2 months → 20 min)
# 6. payment (2 months → 20 min) [PCI gate]
# 7. supporting (3 months → 30 min)
# 8. cutover (1 month → 10 min)
# 9. decommission (1 month → 10 min)
```

## Quality Gates Per Phase

### Phase Gate Criteria
| Phase | Gate | Criteria |
|-------|------|----------|
| Foundation | Infra Ready | K8s healthy, Istio mTLS, Observability 100%, CDC < 5s lag |
| Catalog | Shadow Pass | 2 weeks 100% shadow, < 0.1% diff, 2x load test pass |
| User | Auth Parity | Session bridge 99.99%, MFA working, password migration tested |
| Cart | Feature Parity | All cart features, merge anonymous→auth, persistence |
| Order | Saga Complete | Full lifecycle, compensation tested, legacy read-only |
| Payment | PCI Certified | QSA audit passed, tokenization verified, 30-day parallel run |
| Supporting | Feature Parity | Admin dashboard, reporting, integrations all green |
| Cutover | Zero Downtime | DNS switch < 30s, rollback < 5min, 48hr hypercare green |
| Decommission | Clean Shutdown | Data archived, VMs off, docs complete, knowledge transferred |

## Monitoring During Migration

### Migration Dashboard (Grafana)
```
┌────────────────────────────────────────────────────────────┐
│ MIGRATION OVERVIEW                    │ CUTOVER READINESS  │
├────────────────────────────────────────────────────────────┤
│ Traffic Split: Legacy 60% / New 40%   │ ✅ Foundation      │
│ Error Rate: Legacy 0.2% / New 0.1%    │ ✅ Catalog         │
│ Latency p99: Legacy 800ms / New 200ms │ ✅ User            │
│ CDC Lag: 2.3s                         │ ✅ Cart            │
│ Dual-Write Success: 99.98%            │ 🔄 Order (80%)     │
│ Shadow Diff Rate: 0.05%               │ ⏳ Payment (60%)   │
│ Feature Flags: 12 active              │ ⏳ Supporting (0%) │
└────────────────────────────────────────────────────────────┘
```

### Key Alerts
```yaml
# Migration-specific alerts
- alert: MigrationCDCLogHigh
  expr: debezium_lag_seconds > 30
  labels:
    severity: critical
    team: migration
  annotations:
    runbook: "https://runbooks/migration/cdc-lag"

- alert: MigrationDualWriteFailure
  expr: dual_write_failure_rate > 0.01
  labels:
    severity: critical
  annotations:
    runbook: "https://runbooks/migration/dual-write-failure"

- alert: MigrationShadowMismatch
  expr: shadow_response_diff_rate > 0.001
  labels:
    severity: warning
  annotations:
    runbook: "https://runbooks/migration/shadow-mismatch"

- alert: MigrationCutoverRollback
  expr: migration_rollback_triggered == 1
  labels:
    severity: critical
  annotations:
    runbook: "https://runbooks/migration/emergency-rollback"
```

## Compliance Evidence Package

### PCI DSS (Payment Migration)
- [ ] Network segmentation diagram
- [ ] Tokenization implementation evidence
- [ ] Encryption at rest/in transit configs
- [ ] Penetration test report (pre-cutover)
- [ ] QSA Attestation of Compliance
- [ ] Incident response plan tested

### GDPR (Data Migration)
- [ ] Data mapping document (legacy → new)
- [ ] DPIA for migration project
- [ ] Consent migration records
- [ ] Right to erasure API tested
- [ ] 72-hour breach notification drill
- [ ] Data processing agreements updated

### SOX (Financial Controls)
- [ ] Change management log (all migrations)
- [ ] Access review records (quarterly)
- [ ] Audit trail immutability proof
- [ ] Financial reconciliation reports
- [ ] Segregation of duties matrix

## Running the Example

### Simulated Migration (Testing)
```bash
# Quick simulation (all phases in ~3 hours)
/sdet-orchestrate --workflow migration-full --timeline accelerated --simulate

# With real infrastructure (requires AWS/GCP credits)
/sdet-orchestrate --workflow migration-full --timeline real --provision-infra
```

### Individual Phase Testing
```bash
# Test CDC pipeline
docker-compose -f docker-compose.cdc.yml up -d
/sdet-execute --type contract --service cdc

# Test shadow framework
/sdet-execute --type shadow --service catalog --traffic 10% --duration 1h

# Test data validation
/sdet-execute --type data-validation --tables users,products,orders

# Test rollback
/sdet-execute --type rollback --scenario full-cutover
```

## Troubleshooting

### Common Migration Issues
| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| CDC lag growing | Check Debezium connector, MySQL binlog retention | Restart connector, increase binlog retention |
| Shadow diff > 0.1% | Compare response bodies, check data sync | Fix data mapping, re-run reconciliation |
| Dual-write failures | Check new service health, circuit breakers | Fix new service, adjust fallback logic |
| Cutover rollback | DNS propagation, feature flag issues | Pre-warm DNS, test flag rollback |
| Performance regression | New service not scaled, missing indexes | HPA config, add indexes, query optimization |

### Debug Commands
```bash
# Check CDC status
kubectl logs -n migration -l app=debezium -f

# Check shadow traffic
kubectl logs -n shadow -l app=shadow-proxy -f

# Validate data
/sdet-execute --type data-validation --table orders --deep

# Feature flag status
ldcli flags list --project migration

# Rollback test
/sdet-execute --type rollback --dry-run
```

## Lessons Learned Template
```markdown
# Migration Retrospective: {{SERVICE}}

## What Went Well
- Shadow traffic caught {{N}} bugs before cutover
- Contract tests prevented {{N}} breaking changes
- Feature flags enabled safe rollback {{N}} times

## What Didn't Go Well
- CDC lag spiked during {{EVENT}} (root cause: {{CAUSE}})
- Shadow diff analysis took {{TIME}} (manual review)
- Team coordination overhead during dual-run

## Action Items
- [ ] Automate shadow diff categorization
- [ ] Add CDC lag prediction alert
- [ ] Improve runbook for {{SCENARIO}}
- [ ] Schedule more cutover rehearsals
```

## References
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Database Migration Patterns](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MigrationPatterns.html)
- [Zero-Downtime Migration](https://cloud.google.com/architecture/migrating-to-cloud-sql-with-zero-downtime)
- [PCI DSS Migration Guide](https://www.pcisecuritystandards.org/documents/PCI_DSS_v4-0_Migration_Guidance.pdf)