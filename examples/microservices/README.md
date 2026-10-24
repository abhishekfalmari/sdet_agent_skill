# Microservices Example Project

## Overview
Distributed e-commerce platform with 8 microservices using gRPC, Kafka, and Kubernetes.

## Architecture
```
microservices/
├── api-gateway/           # Kong/Envoy config
├── user-service/          # Go + gRPC + PostgreSQL
├── catalog-service/       # Java/Spring + gRPC + PostgreSQL + Elasticsearch
├── cart-service/          # Node.js + gRPC + Redis
├── order-service/         # Python/FastAPI + gRPC + PostgreSQL
├── payment-service/       # Rust + gRPC + PostgreSQL (encrypted)
├── notification-service/  # Go + gRPC + Kafka consumers
├── inventory-service/     # Java/Spring + gRPC + PostgreSQL
├── shared/
│   ├── proto/             # Protobuf definitions
│   ├── events/            # Avro/Protobuf event schemas
│   └── libs/              # Shared libraries
├── infra/
│   ├── kubernetes/        # Kustomize/Helm charts
│   ├── terraform/         # Cloud infrastructure
│   └── helm/              # Helm charts
├── tests/
│   ├── contract/          # Pact contract tests
│   ├── integration/       # Testcontainers + kind
│   ├── chaos/             # LitmusChaos experiments
│   ├── performance/       # k6 load tests
│   └── e2e/               # Full flow tests
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Local development
├── kind-config.yaml       # Kind cluster config
└── skaffold.yaml          # Local dev sync
```

## Requirements (requirements/)
See `requirements/` folder for:
- `functional.md` - User stories and acceptance criteria
- `non-functional.md` - Performance, security, observability requirements

## Quick Start

### 1. Analyze Requirements
```bash
/sdet-analyze --source ./requirements --format json
```

### 2. Generate Test Cases
```bash
/sdet-generate --template api --includeNegative --includeBoundary
/sdet-generate --template contract --includeNegative
/sdet-generate --template chaos --includeNegative
```

### 3. Validate Test Cases
```bash
/sdet-validate --strict
```

### 4. Generate Automation
```bash
# Contract tests for all services
/sdet-automate --type contract --framework pact --services all

# Integration tests
/sdet-automate --type api --framework grpc --services order,payment,inventory

# Chaos experiments
/sdet-automate --type chaos --framework litmus --scope all

# Performance tests
/sdet-automate --type performance --framework k6 --services all
```

### 5. Execute Tests
```bash
# Contract tests (fast, parallel)
/sdet-execute --type contract --parallel 8

# Integration tests (kind cluster)
/sdet-execute --type integration --env kind --parallel 4

# Chaos experiments (staging)
/sdet-execute --type chaos --env staging --experiment pod-kill

# Performance tests
/sdet-execute --type performance --env staging --vus 1000 --duration 10m
```

### 6. Analyze Results
```bash
/sdet-analyze-results --updateExcel --createDefects
```

### 7. Generate CI/CD Pipeline
```bash
/sdet-deploy --platform github-actions --qualityGates --gitops
```

### 8. Full Pipeline
```bash
/sdet-orchestrate --workflow full --autoApprove
```

## Key Features to Test

### Functional
- **Saga Orchestration**: Order creation across 5 services with compensation
- **Service Communication**: gRPC unary/streaming, Kafka events
- **Service Discovery**: Health checks, load balancing
- **Data Consistency**: Eventual consistency, read models, outbox pattern
- **Idempotency**: All mutating endpoints

### Non-Functional
- **Performance**: Per-service latency budgets, 50K RPS gateway
- **Security**: mTLS, zero trust, field-level encryption, PCI isolation
- **Observability**: Distributed tracing (OpenTelemetry), metrics (Prometheus), logging (Loki)
- **Resilience**: Circuit breakers, bulkheads, retries, fallbacks
- **Chaos Engineering**: Pod kill, network partition, resource exhaustion

## Test Scenarios

### Contract Tests (Pact)
- Each service as provider
- Consumers: API Gateway, other services
- gRPC + REST contracts
- Schema registry for events
- `can-i-deploy` gate in CI

### Integration Tests (Testcontainers + kind)
- Local: Per-service Testcontainers (DB, Kafka, Redis)
- CI: Kind cluster with all services
- Staging: Dedicated namespace per PR
- Data: Synthetic, seeded per test class

### Chaos Experiments (LitmusChaos)
| Experiment | Target | Blast Radius | Abort Condition |
|------------|--------|--------------|-----------------|
| Pod Kill | All services | 1 pod | Error rate > 1% |
| Network Latency | Service mesh | 1 namespace | p99 > 2x baseline |
| Network Partition | Cross-service | 2 services | Saga timeout > 30s |
| CPU Stress | Payment, Order | 1 pod | CPU > 90% 5min |
| Memory Pressure | Catalog | 1 pod | OOM kill |
| Disk Fill | PostgreSQL | 1 pod | Disk > 90% |
| Clock Skew | All | 1 namespace | Timestamp drift > 5s |
| DNS Failure | External calls | 1 service | Timeout rate > 5% |

### Performance Tests (k6)
- **Load**: 1000 VU, 10min, all endpoints
- **Stress**: Ramp to 5000 VU, find saturation
- **Soak**: 500 VU, 24h, memory/connection leaks
- **Spike**: 10x baseline for 5min (flash sale)
- **Breakpoint**: Gradual increase until 5xx > 5%

### End-to-End Flow Tests
- Order placement (full saga)
- Payment failure → compensation
- Inventory reservation → release
- Notification delivery
- Cross-service tracing verification

## CI/CD Pipeline (GitHub Actions + ArgoCD)
```yaml
stages:
  - analyze: Requirement analysis
  - generate: Test case generation
  - validate: Test case validation
  - automate: Automation code generation
  - test:
      - unit: Per-service (parallel)
      - contract: Pact (all services, parallel)
      - integration: Kind cluster (full stack)
      - chaos: Litmus (staging, scheduled)
      - performance: k6 (staging, scheduled)
      - security: SAST/DAST/SCA/Secrets
  - analyze-results: Results analysis
  - build: Container images (cosigned, SBOM)
  - deploy-staging: ArgoCD sync (auto)
  - deploy-prod: ArgoCD sync (manual approval)
  - post-deploy: Smoke tests, canary analysis
```

## Quality Gates
- Unit test coverage: > 85% per service
- Contract tests: 100% consumer coverage
- Integration tests: Critical paths 100%
- No critical/high vulnerabilities
- Performance: All latency budgets met
- Chaos: All experiments pass (hypothesis validated)
- SLOs: Error budget > 50% remaining

## Running the Example

### Local Development (Skaffold)
```bash
# Start local stack
skaffold dev

# Or with docker-compose (lighter)
docker-compose up -d

# Run tests locally
/sdet-orchestrate --workflow quick --autoApprove
```

### Kind Cluster (CI-like)
```bash
# Create cluster
kind create cluster --config kind-config.yaml

# Deploy all services
kubectl apply -k infra/kubernetes/overlays/dev

# Run integration tests
/sdet-execute --type integration --env kind
```

### Staging Deployment
```bash
# ArgoCD manages staging
argocd app sync microservices-staging

# Run full test suite
/sdet-orchestrate --workflow ci --autoApprove
```

## Service Communication Matrix

| Caller → Callee | Protocol | Pattern | Timeout | Retry |
|-----------------|----------|---------|---------|-------|
| API Gateway → All | gRPC/REST | Unary | 5s | 3x |
| Order → Cart | gRPC | Unary | 3s | 3x |
| Order → Inventory | gRPC | Unary | 5s | 3x |
| Order → Payment | gRPC | Unary | 10s | 2x |
| Order → Notification | Kafka | Async | N/A | N/A |
| Payment → Provider | HTTPS | REST | 30s | 3x |
| Inventory → Order | Kafka | Async | N/A | N/A |
| Catalog → Inventory | gRPC | Streaming | 5s | 3x |

## Event Catalog (Kafka Topics)

| Topic | Partitions | Retention | Consumers |
|-------|------------|-----------|-----------|
| user.events | 12 | 7d | Notification, Order |
| catalog.events | 24 | 7d | Search, Order, Notification |
| cart.events | 12 | 7d | Order, Notification |
| order.events | 24 | 30d | Payment, Inventory, Notification |
| payment.events | 12 | 90d | Order, Notification, Reporting |
| inventory.events | 12 | 7d | Order, Catalog, Notification |

## Observability Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Tracing | Tempo + Grafana | Distributed traces |
| Metrics | Prometheus + Grafana | RED/USE metrics, dashboards |
| Logging | Loki + Grafana | Structured logs, correlation |
| Alerting | Alertmanager + PagerDuty | Tiered alerting |
| Profiling | Pyroscope | Continuous profiling |
| Chaos | LitmusChaos | Resilience experiments |

## Security Checklist

- [ ] mTLS enabled for all service-to-service
- [ ] JWT validation at API Gateway
- [ ] Field-level encryption for PII
- [ ] PCI DSS scope minimized (Payment Service only)
- [ ] Secrets in Vault, not config
- [ ] Network policies: deny by default
- [ ] Image signing (cosign)
- [ ] SBOM generation (Syft)
- [ ] Vulnerability scanning (Trivy, Grype)
- [ ] Penetration test annually