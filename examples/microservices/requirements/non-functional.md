# Non-Functional Requirements - Microservices E-Commerce Platform

## Performance Requirements

### NFR-PERF-001: Service Latency Budgets
**Priority**: Critical  
**Targets** (p99, end-to-end including network):
| Service | Operation | Budget |
|---------|-----------|--------|
| API Gateway | Route + Auth | < 50ms |
| User Service | Get Profile | < 100ms |
| Catalog Service | Search | < 200ms |
| Catalog Service | Get Product | < 100ms |
| Cart Service | Get/Update Cart | < 50ms |
| Order Service | Create Order | < 500ms |
| Order Service | Get Order | < 100ms |
| Payment Service | Authorize | < 800ms (external) |
| Inventory Service | Reserve Stock | < 150ms |

### NFR-PERF-002: Throughput
**Priority**: Critical  
**Targets**:
- API Gateway: 50,000 RPS sustained
- Catalog Service: 20,000 RPS (read-heavy)
- Order Service: 5,000 RPS (write-heavy)
- Payment Service: 10,000 RPS
- Kafka: 100,000 events/sec

### NFR-PERF-003: Resource Efficiency
**Priority**: High  
**Targets per Service** (per pod):
- CPU: < 500m average, < 1000m peak
- Memory: < 512MB (Java/Go), < 256MB (Rust/Node)
- Connections: < 100 DB, < 50 gRPC
- Startup: < 10s (health ready)

## Scalability Requirements

### NFR-SCAL-001: Horizontal Scaling
**Priority**: Critical  
**Mechanism**: Kubernetes HPA + VPA  
**Triggers**:
- CPU > 60% for 2min
- Custom: RPS > 1000/pod, queue depth > 100
- Memory > 75%
**Limits**: Min 3, Max 100 replicas per service

### NFR-SCAL-002: Database Scaling
**Priority**: High  
**Strategies**:
- User/Catalog/Order: Read replicas (1 primary + 3 replicas)
- Cart: Redis Cluster (6 shards, 3 replicas)
- Payment: Single primary (consistency), async replicas for reporting
- Inventory: Sharded by warehouse_id

### NFR-SCAL-003: Event Streaming Scale
**Priority**: High  
**Kafka**: 30 brokers, 100 partitions per topic  
**Retention**: 7 days hot, 1 year cold (S3)  
**Consumer Groups**: Per service, max lag < 1000

## Availability Requirements

### NFR-AVAIL-001: Service Level Objectives
**Priority**: Critical  
**SLOs** (30-day rolling):
| Service | Availability | Latency p99 | Error Rate |
|---------|-------------|-------------|------------|
| API Gateway | 99.99% | < 100ms | < 0.01% |
| User Service | 99.95% | < 200ms | < 0.1% |
| Catalog Service | 99.95% | < 300ms | < 0.1% |
| Cart Service | 99.99% | < 100ms | < 0.01% |
| Order Service | 99.95% | < 1s | < 0.1% |
| Payment Service | 99.99% | < 2s | < 0.01% |
| Inventory Service | 99.95% | < 300ms | < 0.1% |

### NFR-AVAIL-002: Multi-Region Deployment
**Priority**: High  
**Architecture**: Active-Passive (Primary: us-east-1, DR: us-west-2)  
**Failover**: Automated via Route53 health checks  
**RTO**: < 5 minutes  
**RPO**: < 30 seconds (async DB replication)

### NFR-AVAIL-003: Graceful Degradation
**Priority**: Critical  
**Patterns**:
- Catalog: Serve stale cache (5min TTL) if ES down
- Cart: Local Redis, sync when primary recovers
- Payment: Queue for async processing if gateway down
- Notification: Buffer in Kafka, retry with backoff
- Search: Fallback to DB LIKE queries

## Security Requirements

### NFR-SEC-001: Zero Trust Network
**Priority**: Critical  
**Implementation**:
- mTLS for all service-to-service (Istio/Linkerd)
- SPIFFE/SPIRE for identity
- Network policies: deny by default
- Egress controls for external calls

### NFR-SEC-002: Authentication & Authorization
**Priority**: Critical  
**Standards**:
- API Gateway: JWT validation (RS256), JWKS caching
- Service-to-Service: mTLS + JWT (workload identity)
- RBAC: Roles (admin, customer, support) + permissions
- ABAC: Resource-level (order ownership)

### NFR-SEC-003: Data Protection
**Priority**: Critical  
**Encryption**:
- In Transit: mTLS 1.3 (all internal), TLS 1.3 (external)
- At Rest: AES-256 (PostgreSQL TDE, Redis, Kafka)
- Field-Level: PII encrypted with envelope encryption (KMS)
- Key Rotation: 90 days automated

### NFR-SEC-004: Compliance
**Priority**: High  
**Standards**:
- PCI DSS: Payment Service isolated (Level 1)
- GDPR: Data subject APIs, DPIA, consent records
- SOC 2: Audit logs, access reviews, change management
- ISO 27001: ISMS aligned

## Observability Requirements

### NFR-OBS-001: Distributed Tracing
**Priority**: Critical  
**Implementation**: OpenTelemetry SDK (auto-instrumentation)  
**Coverage**: 100% services, 100% RPCs  
**Sampling**: Tail-based (keep errors, slow traces)  
**Storage**: Tempo (Grafana) / Jaeger  
**Retention**: 30 days hot, 1 year archive

### NFR-OBS-002: Metrics
**Priority**: Critical  
**System**: Prometheus + Grafana + Alertmanager  
**Metrics Types**:
- Infrastructure: Node, pod, container (cAdvisor, kube-state-metrics)
- Application: RED (Rate, Errors, Duration) per endpoint
- Business: Orders, revenue, conversion, cart abandonment
- Kafka: Consumer lag, throughput, under-replicated partitions
**Cardinality**: Limit high-cardinality labels (user_id, request_id)

### NFR-OBS-003: Logging
**Priority**: Critical  
**Format**: Structured JSON (ECS/OTel semantic conventions)  
**Fields**: timestamp, level, service, trace_id, span_id, user_id, message, attributes  
**Pipeline**: Fluent Bit → Kafka → Loki/Elasticsearch  
**PII**: Automatic redaction (regex + ML)  
**Retention**: 30 days hot, 1 year warm, 7 years cold (compliance)

### NFR-OBS-004: Alerting Strategy
**Priority**: Critical  
**Tiers**:
- P1 (Page): SLO breach, service down, error budget burn > 2%
- P2 (Ticket): High latency, saturation, dependency degradation
- P3 (Log): Info for debugging
**Principles**: 
- Alert on symptoms, not causes
- No alert fatigue: grouping, inhibition, auto-resolve
- Runbook links on every alert

## Reliability Requirements

### NFR-REL-001: Resilience Patterns
**Priority**: Critical  
**Per Service**:
| Pattern | Implementation |
|---------|----------------|
| Circuit Breaker | Resilience4j (Java), gobreaker (Go), pybreaker (Python) |
| Bulkhead | Thread pool / semaphore per downstream |
| Timeout | Configurable per call (default 5s) |
| Retry | Exponential backoff (max 3), jitter |
| Rate Limit | Token bucket (local + distributed) |
| Fallback | Cached response / default / error |

### NFR-REL-002: Data Consistency
**Priority**: Critical  
**Patterns**:
- Saga: Orchestrated (Order Service) for multi-service writes
- Event Sourcing: Order Service (state reconstruction)
- CQRS: Catalog (read model separate from write)
- Idempotency: All mutating endpoints (idempotency keys)
- Outbox Pattern: Reliable event publishing (DB + Kafka)

### NFR-REL-003: Disaster Recovery
**Priority**: High  
**Backup**:
- PostgreSQL: Daily snapshots + WAL archiving (PITR)
- Redis: RDB + AOF, cross-region replica
- Kafka: MirrorMaker2 cross-cluster replication
**Restore**: Tested monthly, RTO < 1hr, RPO < 5min

### NFR-REL-004: Deployment Safety
**Priority**: High  
**Strategies**:
- Canary: 5% → 25% → 100% over 30min
- Feature Flags: LaunchDarkly for instant rollback
- Schema: Backward-compatible migrations only
- Contract Tests: Pact verification before deploy

## Operational Requirements

### NFR-OPS-001: GitOps Deployment
**Priority**: High  
**Tools**: ArgoCD / Flux  
**Structure**:
- Apps repo: Kustomize/Helm per service
- Infra repo: Terraform for clusters, networking
- Promotion: PR → Staging → Production (auto-sync)

### NFR-OPS-002: Configuration Management
**Priority**: High  
**Secrets**: Vault (dynamic secrets) + Sealed Secrets (Git)  
**Config**: ConfigMaps + External Secrets Operator  
**Feature Flags**: LaunchDarkly (runtime), ConfigMap (build-time)

### NFR-OPS-003: Capacity Planning
**Priority**: Medium  
**Reviews**: Monthly (automated report)  
**Metrics**: Resource utilization trends, cost per service  
**Scaling Events**: Pre-defined runbooks for 50/75/90% capacity

### NFR-OPS-004: Incident Response
**Priority**: Critical  
**Process**: 
- Detection: Alert → PagerDuty → On-call
- Triage: Runbook, dashboard, traces
- Resolution: Fix / Rollback / Scale / Failover
- Postmortem: Blameless, action items tracked

## Testability Requirements

### NFR-TEST-001: Contract Testing
**Priority**: Critical  
**Tool**: Pact (consumer-driven)  
**Contracts**: Protobuf + HTTP (gRPC + REST)  
**Flow**: Consumer publishes → Broker → Provider verifies  
**Gate**: `can-i-deploy` in CI/CD

### NFR-TEST-002: Integration Testing
**Priority**: Critical  
**Environments**: 
- Local: Testcontainers (per service)
- CI: Kubernetes kind cluster (full stack)
- Staging: Dedicated namespace per PR
**Data**: Synthetic test data, seeded per test

### NFR-TEST-003: Chaos Testing
**Priority**: High  
**Tool**: LitmusChaos / Chaos Mesh  
**Experiments** (weekly automated):
- Pod kill (random, targeted)
- Network: latency, partition, packet loss
- Resource: CPU stress, memory pressure, disk fill
- Time: clock skew
- DNS: resolution failure
**Safety**: Blast radius (namespace), abort on SLO breach

### NFR-TEST-004: Performance Testing
**Priority**: Critical  
**Tool**: k6 (distributed)  
**Types**:
- Load: Daily CI (baseline)
- Stress: Weekly (find limits)
- Soak: Monthly (24h, find leaks)
- Spike: Pre-event (Black Friday)
**Thresholds**: Defined in quality-gates.yaml per service

## Service-Specific Requirements

### API Gateway
- Rate limiting: 1000 req/min per client
- Request/response transformation
- GraphQL federation (if applicable)
- WAF rules (OWASP Top 10)

### User Service
- Password: Argon2id, 12 rounds
- Sessions: JWT (15m) + Refresh (7d, rotating)
- MFA: TOTP, WebAuthn, SMS
- Account lockout: 5 failures → 15min

### Catalog Service
- Search: Elasticsearch 8.x, semantic search
- Images: CDN (Cloudflare Images), WebP/AVIF
- Facets: Category, brand, price, attributes
- Real-time inventory sync (< 1s)

### Cart Service
- TTL: 30 days inactive
- Merge: Anonymous → authenticated
- Concurrency: Optimistic locking (version)
- Max items: 100 per cart

### Order Service
- State Machine: Explicit transitions only
- Idempotency: Order creation (key: cart_id)
- Archive: Orders > 2 years to cold storage
- Audit: Full history per order

### Payment Service
- PCI: SAQ A-EP, tokenization only
- Providers: Stripe, Adyen, Braintree (pluggable)
- 3DS2: Challenge flow support
- Reconciliation: Daily batch vs provider

### Inventory Service
- Reservation: Optimistic with compensation
- Allocation: FIFO per warehouse
- Backorder: Configurable threshold
- Adjustments: Audit trail required

### Notification Service
- Templates: Handlebars, versioned
- Preferences: Per channel per event type
- Deduplication: 1hr window per user/event
- Delivery tracking: Sent → Delivered → Opened → Clicked

## Infrastructure Requirements

### NFR-INFRA-001: Kubernetes
**Version**: 1.28+ (EKS/GKE/AKS)  
**Nodes**: Mixed (general, memory-optimized, CPU-optimized)  
**Add-ons**: 
- Istio (service mesh)
- Cert-manager (TLS)
- External DNS
- Cluster Autoscaler

### NFR-INFRA-002: Networking
**CNI**: Cilium (eBPF)  
**Ingress**: Istio Gateway / NGINX  
**Service Mesh**: Istio (mTLS, traffic management)  
**DNS**: CoreDNS + External DNS

### NFR-INFRA-003: Storage
**PostgreSQL**: Cloud SQL / RDS / CloudNativePG  
**Redis**: Elasticache / Redis Enterprise / Operator  
**Kafka**: Strimzi Operator / Confluent Cloud  
**Object Storage**: S3 / GCS (backups, images, logs)

### NFR-INFRA-004: CI/CD
**Platform**: GitHub Actions / GitLab CI / Argo Workflows  
**Pipeline**: Build → Test → Contract → Security → Deploy  
**Artifacts**: Container images (cosigned), Helm charts, SBOM  
**Security**: SLSA Level 3, Sigstore signing