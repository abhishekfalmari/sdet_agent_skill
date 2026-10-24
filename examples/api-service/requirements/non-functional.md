# Non-Functional Requirements - Payment Gateway API Service

## Performance Requirements

### NFR-PERF-001: API Latency
**Priority**: Critical  
**Metric**: p99 latency per endpoint  
**Targets**:
- POST /v1/payment_intents: < 300ms
- POST /v1/payment_intents/{id}/confirm: < 500ms (excluding 3DS)
- POST /v1/refunds: < 400ms
- GET /v1/customers/{id}: < 100ms
- POST /v1/webhook_endpoints: < 200ms
- Webhook delivery: < 2s end-to-end
**Measurement**: APM (Datadog), synthetic monitoring, load tests

### NFR-PERF-002: Throughput
**Priority**: Critical  
**Metric**: Transactions per second (TPS)  
**Targets**:
- Sustained: 10,000 TPS
- Peak (Black Friday): 50,000 TPS
- Burst (10s): 100,000 TPS
**Measurement**: k6 load tests, production metrics

### NFR-PERF-003: Concurrent Connections
**Priority**: High  
**Metric**: Simultaneous open connections  
**Target**: 100,000 concurrent connections  
**Measurement**: Load test with keep-alive

### NFR-PERF-004: Database Performance
**Priority**: Critical  
**Targets**:
- Payment intent create: < 50ms p99 (DB write)
- Customer lookup: < 20ms p99 (DB read)
- Connection pool: 200 connections, < 10ms acquire
- Read replica lag: < 100ms

## Scalability Requirements

### NFR-SCAL-001: Horizontal Scaling
**Priority**: Critical  
**Requirement**: Stateless API pods, HPA based on CPU/RPS  
**Configuration**:
- Min replicas: 10, Max: 200
- Scale-up: CPU > 60% or RPS > 1000/pod
- Scale-down: CPU < 30% for 10min
- Pod startup: < 30s (pre-warmed connections)

### NFR-SCAL-002: Database Sharding
**Priority**: High  
**Strategy**: Shard by merchant_id (consistent hashing)  
**Shards**: 64 logical shards, 8 physical replicas  
**Migration**: Online shard splitting, zero-downtime

### NFR-SCAL-003: Idempotency & Deduplication
**Priority**: Critical  
**Requirement**: All mutating endpoints support idempotency keys  
**Storage**: Redis (TTL 24h) + persistent log  
**Throughput**: 1M keys/sec lookup

## Availability Requirements

### NFR-AVAIL-001: Uptime SLA
**Priority**: Critical  
**Target**: 99.99% monthly (4.38 min downtime)  
**Measurement**: Synthetic checks (1min interval, 5 regions)  
**Exclusions**: Scheduled maintenance (max 4h/month, announced 72h prior)

### NFR-AVAIL-002: Error Budget
**Priority**: Critical  
**Targets**:
- 5xx error rate: < 0.01% (critical paths)
- 4xx error rate: < 1% (client errors acceptable)
- Timeout rate: < 0.1%
**Burn Rate Alerts**:
- 1% errors in 5min → Page (fast burn)
- 0.1% errors in 1hr → Ticket (slow burn)

### NFR-AVAIL-003: Disaster Recovery
**Priority**: Critical  
**RTO**: < 5 minutes (automated failover)  
**RPO**: < 30 seconds (async replication)  
**Architecture**: Multi-region active-active (primary + 2 standbys)  
**Failover**: Automated via DNS + health checks  
**Data**: Cross-region replication, point-in-time recovery

### NFR-AVAIL-004: Degraded Mode
**Priority**: High  
**Requirement**: Core payments work during partial outages  
**Capabilities**:
- Read-only mode for reporting
- Queue webhooks for later delivery
- Fallback to cached exchange rates
- Circuit breakers for external dependencies

## Security Requirements

### NFR-SEC-001: PCI DSS Level 1
**Priority**: Critical  
**Requirements**:
- SAQ D compliance, annual audit
- No card data in logs, metrics, or APM
- Tokenization: PAN never touches API layer
- Network segmentation: CDE isolated VPC
- Quarterly ASV scans, annual penetration test

### NFR-SEC-002: Authentication & Authorization
**Priority**: Critical  
**Standards**: OAuth 2.0, mTLS for server-to-server  
**API Keys**: Prefixed (sk_live_, sk_test_), rotatable, scoped  
**JWT**: RS256, 15min access, 24h refresh  
**Scopes**: payments:read, payments:write, customers:read, webhooks:write  
**Rate Limiting**: 1000 req/min per key, burst 200

### NFR-SEC-003: Encryption
**Priority**: Critical  
**In Transit**: TLS 1.3 only, HSTS, certificate pinning for SDKs  
**At Rest**: AES-256-GCM (database, secrets, backups)  
**Field-Level**: PII (email, phone, address) encrypted with separate keys  
**Key Management**: AWS KMS / HashiCorp Vault, annual rotation

### NFR-SEC-004: Input Validation & Sanitization
**Priority**: Critical  
**Requirements**:
- Strict schema validation (JSON Schema / Protobuf)
- Size limits: body < 1MB, fields per schema
- SQL/NoSQL injection prevention (parameterized queries)
- XSS prevention (no HTML in API responses)
- Path traversal prevention

### NFR-SEC-005: Audit Logging
**Priority**: High  
**Requirements**:
- Immutable audit log (append-only, signed)
- Events: auth, data access, config changes, admin actions
- Retention: 7 years (compliance)
- Query: Structured search, export for auditors

## Compliance Requirements

### NFR-COMP-001: GDPR
**Priority**: High  
**Requirements**:
- Data subject rights: access, rectification, erasure, portability
- DPIA for new processing activities
- Data processing agreements with subprocessors
- 72-hour breach notification
- EU data residency option

### NFR-COMP-002: SOX / Financial Controls
**Priority**: High  
**Requirements**:
- Change management: PR approval, deployment audit trail
- Access reviews: Quarterly for privileged access
- Segregation of duties: Dev ≠ Prod deploy
- Financial data integrity: reconciliation reports

### NFR-COMP-003: PSD2 / SCA
**Priority**: Critical (EU)  
**Requirements**:
- Strong Customer Authentication (3DS2) for EUR payments
- Exemptions: low value, recurring, trusted beneficiaries
- Dynamic linking: amount + payee in authentication
- TPP (Third Party Provider) API access

## Observability Requirements

### NFR-OBS-001: Logging
**Priority**: Critical  
**Format**: Structured JSON, correlation IDs (trace_id, span_id)  
**Fields**: timestamp, level, service, trace_id, span_id, user_id, merchant_id, event  
**PII Masking**: Automatic redaction of PAN, CVV, passwords, tokens  
**Sampling**: 100% errors, 10% info/debug  
**Retention**: Hot 30d, cold 1yr, archive 7yr

### NFR-OBS-002: Metrics
**Priority**: Critical  
**System**: Prometheus + Grafana  
**Key Metrics (RED)**:
- Rate: requests/sec by endpoint, status
- Errors: 5xx rate, 4xx rate, timeout rate
- Duration: p50, p95, p99 latency per endpoint
**Business Metrics**:
- Payment success rate by method/country
- Authorization rates, decline codes
- Webhook delivery success rate

### NFR-OBS-003: Distributed Tracing
**Priority**: Critical  
**System**: OpenTelemetry → Jaeger/Tempo  
**Sampling**: 10% baseline, 100% errors, tail-based  
**Spans**: HTTP, DB, external calls, message queues  
**Context Propagation**: W3C TraceContext headers

### NFR-OBS-004: Alerting
**Priority**: Critical  
**Tiers**:
- P1 (Page): SLO breach, 5xx > 0.1%, p99 > 2x baseline
- P2 (Ticket): 4xx spike, queue depth, disk space
- P3 (Log): Info/debug for investigation
**No Alert Fatigue**: Grouping, inhibition, auto-resolution

## Reliability Requirements

### NFR-REL-001: Idempotency Guarantees
**Priority**: Critical  
**Requirement**: Exactly-once semantics for payments  
**Implementation**: Idempotency keys with 24h TTL, conflict detection  
**Client SDK**: Auto-generate keys, retry with same key

### NFR-REL-002: Data Consistency
**Priority**: Critical  
**Model**: Eventual consistency for reporting, strong for payments  
**Patterns**: Saga for multi-step (payment + inventory + notification)  
**Compensation**: Automatic refund on downstream failure

### NFR-REL-003: Graceful Degradation
**Priority**: High  
**Patterns**:
- Circuit breakers: Hystrix/Resilience4j for external calls
- Bulkheads: Separate thread pools per dependency
- Fallbacks: Cached responses, static defaults
- Timeouts: Configurable per dependency (default 5s)

### NFR-REL-004: Queue-Based Processing
**Priority**: High  
**System**: Kafka (events), Redis Streams (webhooks)  
**Guarantees**: At-least-once delivery, ordering per merchant  
**DLQ**: Failed messages after 5 retries, alerting

## Operational Requirements

### NFR-OPS-001: Deployment
**Priority**: High  
**Strategy**: Blue-green for API, Canary for risky changes  
**Frequency**: On-demand (main), Daily (release branch)  
**Rollback**: < 2 minutes (automated on health check failure)  
**Pre-deploy**: Contract tests, schema migration validation

### NFR-OPS-002: Configuration Management
**Priority**: High  
**System**: Consul + Vault, environment variables for secrets  
**Feature Flags**: LaunchDarkly for gradual rollout  
**Schema Migrations**: Backward-compatible, zero-downtime  
**Secrets Rotation**: 90 days, automated

### NFR-OPS-003: Capacity Planning
**Priority**: Medium  
**Reviews**: Monthly capacity review, quarterly load test  
**Scaling Triggers**: Pre-defined runbooks for 50%, 75%, 90% capacity  
**Chaos Engineering**: Monthly experiments (Litmus/Gremlin)

## Testability Requirements

### NFR-TEST-001: Contract Testing
**Priority**: Critical  
**Tool**: Pact (consumer-driven)  
**Consumers**: Web SDK, Mobile SDK, Merchant Dashboard, Partner APIs  
**Execution**: CI on every PR, scheduled provider verification

### NFR-TEST-002: Chaos & Resilience Testing
**Priority**: High  
**Scenarios**: Dependency failure, network partition, clock skew, resource exhaustion  
**Frequency**: Weekly automated, monthly game day

### NFR-TEST-003: Security Testing
**Priority**: Critical  
**SAST**: Every PR (Semgrep, CodeQL)  
**DAST**: Weekly against staging (OWASP ZAP)  
**SCA**: Every build (Trivy, Snyk)  
**Penetration Test**: Annual third-party

### NFR-TEST-004: Performance Testing
**Priority**: Critical  
**Types**: Load (daily CI), Stress (weekly), Soak (monthly), Spike (pre-event)  
**Tool**: k6 (scripted, version-controlled)  
**Thresholds**: Defined per endpoint in quality-gates.yaml