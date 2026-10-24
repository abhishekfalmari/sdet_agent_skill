# Web Application Example Project

## Overview
E-commerce web application with React frontend, Node.js/Express API, PostgreSQL database, and Redis cache.

## Architecture
```
web-app/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
├── database/          # PostgreSQL migrations
├── tests/             # Playwright E2E, API, Unit tests
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml # Local development stack
```

## Requirements (requirements/)
See `requirements/` folder for:
- `functional.md` - User stories and acceptance criteria
- `non-functional.md` - Performance, security, accessibility requirements
- `api-spec.yaml` - OpenAPI 3.0 specification
- `ui-spec.md` - UI/UX specifications

## Quick Start

### 1. Analyze Requirements
```bash
/sdet-analyze --source ./requirements --format json
```

### 2. Generate Test Cases
```bash
/sdet-generate --template standard --includeNegative --includeBoundary
```

### 3. Validate Test Cases
```bash
/sdet-validate --strict
```

### 4. Generate Automation
```bash
/sdet-automate --type ui,api --framework playwright --pattern pom
```

### 5. Execute Tests
```bash
/sdet-execute --type ui,api --parallel 4 --retry 2
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

## Project Structure

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API client services
│   ├── store/          # State management (Zustand/Redux)
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript types
├── tests/
│   ├── unit/           # Vitest unit tests
│   ├── integration/    # React Testing Library
│   └── e2e/            # Playwright E2E tests
├── package.json
├── tsconfig.json
├── vite.config.ts
└── playwright.config.ts
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── routes/         # API route handlers
│   ├── controllers/    # Request controllers
│   ├── services/       # Business logic
│   ├── models/         # Data models (Prisma/TypeORM)
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   └── config/         # Configuration
├── tests/
│   ├── unit/           # Jest unit tests
│   ├── integration/    # Supertest API tests
│   └── contract/       # Pact contract tests
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── jest.config.ts
```

## Key Features to Test

### Functional
- User authentication (register, login, logout, password reset)
- Product catalog (search, filter, sort, pagination)
- Shopping cart (add, update, remove, persist)
- Checkout flow (address, payment, confirmation)
- Order management (history, details, cancellation)
- User profile (settings, addresses, preferences)

### Non-Functional
- **Performance**: Page load < 3s, API p95 < 500ms
- **Security**: OWASP Top 10, JWT auth, input validation
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Responsive**: Mobile, tablet, desktop

## Test Scenarios

### UI Tests (Playwright)
- Login/logout flows
- Product search and filtering
- Add to cart and checkout
- Order history and details
- Responsive design verification
- Visual regression (Percy/Playwright Visual)

### API Tests (Playwright/Pactum)
- CRUD operations for all entities
- Authentication and authorization
- Input validation and error handling
- Rate limiting
- Contract testing (Pact)

### Performance Tests (k6)
- Load test: 1000 VU for 10min
- Stress test: Ramp to breaking point
- Soak test: 100 VU for 1hr
- Spike test: Sudden 10x traffic

### Security Tests
- SAST: Semgrep/CodeQL on CI
- DAST: OWASP ZAP against staging
- SCA: Trivy/Snyk for dependencies
- Secrets: TruffleHog on repo

## CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
stages:
  - analyze: Requirement analysis
  - generate: Test case generation
  - validate: Test case validation
  - automate: Automation code generation
  - test:
      - unit: Frontend + Backend unit tests
      - api: API integration tests
      - ui: E2E UI tests (parallel)
      - visual: Visual regression
      - performance: k6 load tests
      - security: SAST/DAST/SCA
      - accessibility: axe-core
  - analyze-results: Results analysis
  - deploy: Staging deployment
  - release: Production release gate
```

## Quality Gates
- Unit test coverage: > 80%
- Integration test coverage: > 70%
- E2E test coverage: Critical paths 100%
- No critical/high security vulnerabilities
- Accessibility: WCAG 2.1 AA
- Performance: p95 < 500ms, error rate < 1%
- Zero flaky tests in main branch

## Running the Example
```bash
# Start local stack
docker-compose up -d

# Run database migrations
cd backend && npx prisma migrate dev

# Start development servers
cd frontend && npm run dev
cd backend && npm run dev

# Run SDET pipeline
/sdet-orchestrate --workflow quick --autoApprove
```