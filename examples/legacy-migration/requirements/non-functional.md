# Non-Functional Requirements - Legacy Migration

## Performance Requirements

### NFR-PERF-001: Migration Performance
**Priority**: Critical  
**Targets**:
- CDC replication lag: < 5 seconds (MySQL → Kafka → PostgreSQL)
- Dual-write latency overhead: < 50ms p99
- Shadow traffic processing: < 100ms additional latency
- Data reconciliation: Full compare < 4 hours (2TB)
- Cutover DNS switch: < 30 seconds global propagation

### NFR-PERF-002: New System Performance (Must Match/Exceed Legacy)
**Priority**: Critical  
**Legacy Baseline**:
- Page load: 4.2s average (PHP server-rendered)
- API p95: 800ms (uncached)
- Concurrent users: 5,000 (vertical scaling)
- Database: 2TB, 10K QPS peak

**New System Targets**:
- Page load (SSR): < 2.5s (LCP Good)
- API p95: < 200ms (cached), < 500ms (uncached)
- Concurrent users: 50,000 (horizontal scaling)
- Database: Partitioned, read replicas, 100K QPS

### NFR-PERF-003: Migration Windows
**Priority**: High  
**Constraints**:
- Maintenance windows: Sunday 2-6 AM UTC (4 hours/week)
- Black Friday freeze: Nov 15 - Dec 31 (no deployments)
- Peak traffic: 10x normal (Black Friday, Cyber Monday)
- Cutover weekend: 48-hour hypercare period

## Scalability Requirements

### NFR-SCAL-001: Legacy Constraints (Current)
**Priority**: Reference  
**Limitations**:
- Vertical scaling only (max 32 vCPU, 128GB RAM)
- Single MySQL writer (no read replicas)
- Session affinity required (sticky sessions)
- No auto-scaling (manual VM provisioning)

### NFR-SCAL-002: New System Scalability
**Priority**: Critical  
**Targets**:
- Kubernetes HPA: CPU > 60%, custom metrics (RPS, queue depth)
- Cluster autoscaler: 3-100 nodes per node pool
- Database: Read replicas (1 primary + 3), connection pooling (PgBouncer)
- Cache: Redis Cluster (6 shards, auto-failover)
- CDN: Cloudflare/CloudFront for static assets

## Availability Requirements

### NFR-AVAIL-001: Legacy Availability (Current)
**Priority**: Reference  
**SLA**: 99.5% (3.65 hours downtime/month)  
**Incidents**: Monthly unplanned outages (2-4 hours each)  
**Recovery**: Manual, 2-6 hours

### NFR-AVAIL-002: New System Availability
**Priority**: Critical  
**SLOs** (30-day rolling):
| Component | Availability | Latency p99 | Error Rate |
|-----------|-------------|-------------|------------|
| API Gateway | 99.99% | < 100ms | < 0.01% |
| Catalog Service | 99.95% | < 300ms | < 0.1% |
| User Service | 99.95% | < 200ms | < 0.1% |
| Cart Service | 99.99% | < 100ms | < 0.01% |
| Order Service | 99.95% | < 1s | < 0.1% |
| Payment Service | 99.99% | < 2s | < 0.01% |

### NFR-AVAIL-003: Migration Availability
**Priority**: Critical  
**Requirements**:
- Zero-downtime migration (Strangler Fig)
- Rollback capability at every phase (< 5 min)
- Dual-running period: 2 weeks minimum per service
- Cutover: Blue-green with instant rollback
- Hypercare: 48 hours post-cutover with war room

## Security Requirements

### NFR-SEC-001: Legacy Security Gaps (Current)
**Priority**: Reference  
**Gaps**:
- No encryption at rest (MySQL)
- TLS 1.0/1.1 still enabled
- No WAF, direct DB access from partners
- PII in plain text (email, address, phone)
- No audit logging for data access
- Password: MD5 (unsalted)
- No MFA, session fixation vulnerable

### NFR-SEC-002: New System Security
**Priority**: Critical  
**Requirements**:
- Encryption: TLS 1.3 everywhere, AES-256 at rest (DB, Redis, Kafka)
- PCI DSS: Payment Service isolated, Level 1 certified
- GDPR: Data subject APIs, consent, DPIA, 72hr breach notification
- Authentication: Argon2id, JWT RS256, MFA (TOTP/WebAuthn), session rotation
- Authorization: RBAC + ABAC, zero-trust network (mTLS)
- Secrets: Vault, rotation 90 days, no secrets in code/config
- Supply Chain: SLSA Level 3, signed images, SBOM

### NFR-SEC-003: Migration Security
**Priority**: Critical  
**Requirements**:
- Data in transit: mTLS for CDC, dual-write encryption
- Access control: Migration team only, audit all access
- PII handling: Masking in non-prod, tokenization in new
- Penetration test: Before each phase cutover
- Compliance: PCI audit before payment cutover

## Data Migration Requirements

### NFR-DATA-001: Data Quality
**Priority**: Critical  
**Requirements**:
- Completeness: 100% rows migrated (reconciliation report)
- Accuracy: Checksum match (MD5 per table), business metric validation
- Consistency: FK integrity enforced in new (was missing in legacy)
- Cleansing: Duplicate removal, standardization (address, phone)
- Archival: 7 years hot, 10 years cold (compliance)

### NFR-DATA-002: Migration Performance
**Priority**: High  
**Targets**:
- Initial bulk load: < 4 hours (parallel, partitioned)
- CDC catch-up: < 30 minutes after bulk load
- Cutover sync: < 5 minutes (final delta)
- Validation: Automated, < 2 hours full comparison

### NFR-DATA-003: Rollback Capability
**Priority**: Critical  
**Requirements**:
- Point-in-time recovery: MySQL binlog + PostgreSQL PITR
- Schema rollback: Backward-compatible migrations only
- Data rollback: Dual-write reverse sync tested
- RTO: < 30 minutes, RPO: < 5 minutes

## Reliability Requirements

### NFR-REL-001: Migration Reliability Patterns
**Priority**: Critical  
**Patterns**:
- **Strangler Fig**: Incremental replacement via API facade
- **Shadow Traffic**: Mirror production to new, compare, no user impact
- **Feature Flags**: Per-service, per-user, percentage rollout
- **Circuit Breakers**: Legacy ↔ New calls, fail fast
- **Idempotency**: All migration operations retry-safe
- **Saga**: Order/payment migration with compensation

### NFR-REL-002: Error Handling During Migration
**Priority**: High  
**Requirements**:
- Legacy errors: Logged, alerted, not blocking new
- New service errors: Fallback to legacy (graceful degradation)
- Data sync errors: Dead letter queue, alerting, manual resolution
- Partial degradation: Continue migration for healthy services

## Observability Requirements

### NFR-OBS-001: Legacy Instrumentation (New)
**Priority**: Critical  
**Implementation**:
- OpenTelemetry PHP auto-instrumentation
- Metrics: Prometheus exporter (latency, errors, throughput)
- Logs: Structured JSON, shipped to Loki
- Traces: W3C TraceContext, propagated to new services

### NFR-OBS-002: Migration-Specific Dashboards
**Priority**: Critical  
**Dashboards**:
- **Migration Overview**: Traffic split %, error rates, latency comparison
- **Data Sync**: CDC lag, dual-write success rate, reconciliation status
- **Service Health**: Per-service (legacy vs new) RED metrics
- **Cutover Readiness**: Checklist, gate status, rollback time

### NFR-OBS-003: Alerting During Migration
**Priority**: Critical  
**Migration Alerts**:
- CDC lag > 30 seconds → Page
- Dual-write failure rate > 1% → Page
- Shadow traffic mismatch > 0.1% → Ticket
- Feature flag change without approval → Page
- Rollback triggered → Page + War room

## Operational Requirements

### NFR-OPS-001: Migration Process
**Priority**: Critical  
**Governance**:
- Migration Review Board: Weekly (Architect, Tech Lead, PM, Security)
- Phase Gate Criteria: Documented, signed off
- Runbooks: Per service, tested in staging
- Communication: Stakeholder updates bi-weekly

### NFR-OPS-002: Deployment During Migration
**Priority**: High  
**Strategy**:
- Legacy: Frozen (critical hotfixes only, change advisory board)
- New: Continuous deployment (ArgoCD, canary)
- Shared: Database migrations (backward-compatible only)
- Freeze periods: Black Friday, month-end, quarter-end

### NFR-OPS-003: Team Structure
**Priority**: High  
**Teams**:
- **Platform Team** (3): Infrastructure, CI/CD, observability
- **Migration Team** (5): Domain services, data sync, testing
- **Legacy Team** (3): Maintenance, hotfixes, knowledge transfer
- **QA Team** (2): Migration testing, UAT coordination

### NFR-OPS-004: Training & Knowledge Transfer
**Priority**: Medium  
**Requirements**:
- Developer onboarding: New stack (2 weeks)
- Admin training: New dashboard (2 days)
- Support training: New debugging tools (1 week)
- Runbook workshops: Monthly during migration

## Compliance Requirements

### NFR-COMP-001: PCI DSS (Payment Migration)
**Priority**: Critical  
**Timeline**: Phase 2 (Month 8-10)  
**Requirements**:
- New payment service: SAQ A-EP → Level 1
- Tokenization: No PAN in new system
- Network segmentation: Payment service isolated VPC
- Audit: QSA assessment before cutover
- Evidence: Migration maintains compliance throughout

### NFR-COMP-002: GDPR (Data Migration)
**Priority**: Critical  
**Requirements**:
- Data mapping: Legacy → New (documented)
- Consent migration: Preserve, re-confirm if needed
- Right to erasure: Implemented in new, legacy API
- DPIA: Completed for migration project
- Breach notification: 72-hour process tested

### NFR-COMP-003: SOX / Financial Controls
**Priority**: High  
**Requirements**:
- Change management: All migrations tracked, approved
- Access reviews: Quarterly for migration team
- Audit trail: Immutable logs for all data changes
- Reconciliation: Financial reports match pre/post migration

## Testability Requirements

### NFR-TEST-001: Migration Testing Strategy
**Priority**: Critical  
**Layers**:
1. **Contract Tests**: Legacy API ↔ New API (Pact, every PR)
2. **Shadow Testing**: Mirror 100% production traffic to new
3. **Comparison Testing**: Automated response diff (legacy vs new)
4. **Chaos Testing**: Failure injection during dual-run
5. **Load Testing**: New system at 2x peak before cutover
6. **UAT**: Beta users (5% traffic) on new system
7. **Cutover Rehearsal**: Monthly dry runs in staging

### NFR-TEST-002: Data Validation Testing
**Priority**: Critical  
**Automation**:
- Row count comparison per table
- Checksum comparison (per partition)
- Business metric validation (revenue, orders, users)
- Referential integrity verification
- Sampling: 1% random deep comparison daily

### NFR-TEST-003: Performance Testing
**Priority**: Critical  
**Schedule**:
- Weekly: New service load test (baseline)
- Bi-weekly: Shadow traffic performance comparison
- Monthly: Full system load test (staging)
- Pre-cutover: 2x peak load for 4 hours (staging)
- Black Friday simulation: 10x normal (staging)

### NFR-TEST-004: Rollback Testing
**Priority**: Critical  
**Frequency**: Monthly  
**Scenarios**:
- Service-level rollback (feature flag)
- Database rollback (PITR)
- Full cutover rollback (DNS + flags)
- Data sync rollback (reverse CDC)
**Success Criteria**: < 30 minutes, zero data loss

## Legacy System Technical Details

### Database Schema (Key Tables)
```sql
-- Legacy MySQL 5.7
users (1.2M rows)          -- MD5 passwords, no FK
products (50K rows)        -- EAV attributes, no normalization
orders (5M rows)           -- Status enum, no history table
order_items (25M rows)     -- Denormalized pricing
customers (800K rows)      -- PII plain text
sessions (10M rows)        -- File-based, no cleanup
inventory (100K rows)      -- Single warehouse
categories (500 rows)      -- Adjacency list
```

### Legacy API Endpoints (Sample)
```
GET    /api/products                    # List with filters
GET    /api/products/{id}               # Detail
POST   /api/cart                        # Add to cart
GET    /api/cart                        # View cart
POST   /api/orders                      # Create order
GET    /api/orders/{id}                 # Order detail
POST   /api/payment/authorize           # Authorize
POST   /api/payment/capture             # Capture
GET    /api/user/profile                # Profile
POST   /api/auth/login                  # Login
```

### Legacy Frontend Routes
```
/                                    # Home
/category/{slug}                     # Category listing
/product/{id}                        # Product detail
/cart                                # Shopping cart
/checkout/*                          # Multi-step checkout
/account/*                           # Account pages
/admin/*                             # Admin panel (separate subdomain)
```

## New System Architecture (Target)

### Services
| Service | Language | Protocol | Database | Status |
|---------|----------|----------|----------|--------|
| API Gateway | Go/Envoy | HTTP/gRPC | - | Phase 1 |
| Catalog | Go | gRPC/REST | PostgreSQL + ES | Phase 2 |
| User | Go | gRPC/REST | PostgreSQL | Phase 2 |
| Cart | Node.js | gRPC/REST | Redis | Phase 2 |
| Order | Python | gRPC/REST | PostgreSQL | Phase 2 |
| Payment | Rust | gRPC/REST | PostgreSQL (enc) | Phase 2 |
| Admin UI | React/TS | GraphQL | - | Phase 3 |
| Reporting | - | SQL | BigQuery | Phase 3 |

### Data Flow (Migration)
```
Production Traffic
       │
       ▼
┌──────────────────┐
│  API Gateway     │──▶ Legacy (decreasing %)
│  (Kong/Envoy)    │
└────────┬─────────┘
         │
         ▼ (increasing %)
┌──────────────────┐
│  New Services    │
│  (K8s + Istio)   │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ CDC   │ │ Dual  │
│(Debez)│ │ Write │
└───┬───┘ └───┬───┘
    ▼         ▼
┌──────────────────┐
│  PostgreSQL      │
│  (New Primary)   │
└──────────────────┘
```

## Migration Checklist (Per Service)

### Pre-Migration
- [ ] Contract tests passing (legacy ↔ new)
- [ ] Shadow traffic: 100% for 2 weeks, < 0.1% mismatch
- [ ] Load test: 2x peak passed
- [ ] Chaos experiments: All hypotheses validated
- [ ] Security review: Penetration test passed
- [ ] Compliance: PCI/GDPR/SOX gates passed
- [ ] Runbook: Written, reviewed, tested in staging
- [ ] Rollback: Tested, < 30 min verified
- [ ] Feature flag: Created, documented, approved
- [ ] Stakeholder sign-off: Product, Engineering, Security

### Migration Execution
- [ ] Feature flag: Enable for 5% (internal)
- [ ] Monitor: 1 hour, error rate < legacy
- [ ] Feature flag: Enable for 25% (beta users)
- [ ] Monitor: 4 hours, business metrics stable
- [ ] Feature flag: Enable for 100%
- [ ] Legacy: Disable (keep running for rollback)
- [ ] Validation: 48 hours hypercare
- [ ] Legacy: Decommission (after 2 weeks stable)

### Post-Migration
- [ ] Documentation updated
- [ ] Runbooks updated
- [ ] Monitoring dashboards updated
- [ ] On-call rotation updated
- [ ] Retrospective conducted
- [ ] Lessons learned documented

## SDET Pipeline for Migration

```bash
# Phase 1: Foundation
/sdet-orchestrate --workflow migration-foundation --autoApprove

# Phase 2: Core domains (per service)
/sdet-analyze --source ./requirements --domain catalog
/sdet-generate --template migration --includeShadow --includeContract
/sdet-validate --strict
/sdet-automate --type contract,shadow,chaos --framework pact,k6,litmus
/sdet-execute --type contract,shadow --duration 2w
/sdet-analyze-results --compareLegacy --createDefects

# Phase 3: Supporting features
/sdet-orchestrate --workflow migration-supporting --autoApprove

# Phase 4: Cutover
/sdet-orchestrate --workflow migration-cutover --manualApproval

# Continuous during migration
/sdet-monitor --platform datadog --migrationDashboard
/sdet-flake --window 7 --action detect
/sdet-predict --model migration-risk --horizon next-week
```

## Success Metrics

### Migration Health
- **Zero customer-facing downtime** during migration
- **Zero data loss** (reconciliation 100% match)
- **Performance**: New system ≥ Legacy at cutover
- **Error rate**: New system ≤ Legacy at cutover
- **Rollback time**: < 30 minutes (tested monthly)

### Business Metrics
- **Revenue**: No dip during migration (±2%)
- **Conversion rate**: Maintained or improved
- **Support tickets**: No increase post-cutover
- **Team velocity**: Measured, sustainable pace

### Technical Metrics
- **CDC lag**: < 5s p99
- **Shadow mismatch**: < 0.1%
- **Deployment frequency**: Daily (new), frozen (legacy)
- **MTTR**: < 15 minutes (new), N/A (legacy)
- **Test coverage**: > 85% (new services)