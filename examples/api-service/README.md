# API Service Example Project

## Overview
Payment Gateway API service with RESTful endpoints for payment processing, customer management, webhooks, and reporting.

## Architecture
```
api-service/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data models (Prisma)
│   ├── middleware/       # Auth, validation, rate limiting
│   ├── utils/            # Helpers
│   └── config/           # Configuration
├── tests/
│   ├── unit/             # Jest unit tests
│   ├── integration/      # Supertest API tests
│   ├── contract/         # Pact contract tests
│   ├── performance/      # k6 load tests
│   └── security/         # SAST/DAST configs
├── prisma/
│   └── schema.prisma
├── .github/workflows/    # CI/CD pipelines
├── docker-compose.yml
└── package.json
```

## Requirements (requirements/)
See `requirements/` folder for:
- `functional.md` - User stories and acceptance criteria
- `non-functional.md` - Performance, security, compliance requirements
- `api-spec.yaml` - OpenAPI 3.0 specification

## Quick Start

### 1. Analyze Requirements
```bash
/sdet-analyze --source ./requirements --format json
```

### 2. Generate Test Cases
```bash
/sdet-generate --template api --includeNegative --includeBoundary
```

### 3. Validate Test Cases
```bash
/sdet-validate --strict
```

### 4. Generate Automation
```bash
/sdet-automate --type api,security,contract --framework pactum,k6 --pattern functional
```

### 5. Execute Tests
```bash
/sdet-execute --type api,contract --parallel 8 --retry 1
```

### 6. Analyze Results
```bash
/sdet-analyze-results --updateExcel --createDefects
```

### 7. Generate CI/CD Pipeline
```bash
/sdet-deploy --platform github-actions --qualityGates
```

### 8. Full Pipeline
```bash
/sdet-orchestrate --workflow full --autoApprove
```

## Key Features to Test

### Functional
- Payment intent lifecycle (create, confirm, capture, cancel)
- Refund processing (full, partial, reasons)
- Customer CRUD with metadata
- Payment method management (attach, detach, list)
- Webhook endpoint CRUD and event delivery
- Dispute evidence submission
- Payout management

### Non-Functional
- **Performance**: p99 < 300ms (payment), 10K TPS sustained
- **Security**: PCI DSS Level 1, OAuth 2.0, field-level encryption
- **Availability**: 99.99% uptime, multi-region active-active
- **Compliance**: GDPR, PSD2/SCA, SOX
- **Reliability**: Idempotency, exactly-once semantics, saga patterns

## Test Scenarios

### API Tests (Pactum/Supertest)
- CRUD operations for all entities
- Authentication and authorization (scopes, rate limits)
- Input validation and error handling (RFC 7807)
- Idempotency key behavior
- Webhook signature verification
- Pagination and filtering

### Contract Tests (Pact)
- Consumer: Web SDK, Mobile SDK, Merchant Dashboard
- Provider: Payment API
- Pact broker integration
- Can-i-deploy checks

### Performance Tests (k6)
- Load test: 10K VU for 10min (sustained)
- Stress test: Ramp to 50K TPS (peak)
- Soak test: 5K VU for 1hr (stability)
- Spike test: Sudden 10x traffic (flash sale)
- Breakpoint test: Find saturation point

### Security Tests
- SAST: Semgrep/CodeQL on every PR
- DAST: OWASP ZAP against staging
- SCA: Trivy/Snyk for dependencies
- Secrets: TruffleHog on repo
- PCI: Annual penetration test

## CI/CD Pipeline (GitHub Actions)
```yaml
stages:
  - analyze: Requirement analysis
  - generate: Test case generation
  - validate: Test case validation
  - automate: Automation code generation
  - test:
      - unit: Jest unit tests
      - integration: Supertest API tests
      - contract: Pact verification
      - performance: k6 load tests
      - security: SAST/DAST/SCA
  - analyze-results: Results analysis
  - deploy: Staging deployment
  - release: Production release gate
```

## Quality Gates
- Unit test coverage: > 85%
- Integration test coverage: > 80%
- Contract tests: 100% consumer coverage
- No critical/high security vulnerabilities
- Performance: p99 < 300ms, error rate < 0.01%
- PCI DSS compliance checks pass

## Running the Example
```bash
# Start local stack
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Run SDET pipeline
/sdet-orchestrate --workflow quick --autoApprove
```

## API Endpoints Summary

| Category | Endpoints |
|----------|-----------|
| Payment Intents | POST/GET /payment_intents, GET/POST /payment_intents/{id}, POST /payment_intents/{id}/confirm, POST /payment_intents/{id}/capture, POST /payment_intents/{id}/cancel |
| Refunds | POST/GET /refunds, GET /refunds/{id} |
| Customers | POST/GET /customers, GET/POST/DELETE /customers/{id} |
| Payment Methods | POST/GET /payment_methods, POST /payment_methods/{id}/attach, POST /payment_methods/{id}/detach |
| Webhooks | POST/GET /webhook_endpoints, GET/POST/DELETE /webhook_endpoints/{id} |
| Disputes | GET /disputes, GET /disputes/{id}, POST /disputes/{id}/evidence |
| Payouts | GET /payouts, GET /payouts/{id} |
| Reports | GET /balance_transactions |