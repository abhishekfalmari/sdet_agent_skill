# Monorepo Example Project

## Overview
E-commerce platform in a single repository using Nx/Turborepo with shared libraries, multiple applications, and coordinated releases.

## Architecture
```
monorepo/
├── apps/
│   ├── web-store/          # Next.js 14+ (App Router) customer storefront
│   ├── admin-dashboard/    # React 18 + Vite + TanStack Router admin panel
│   ├── mobile-api/         # Node.js 20 + Fastify + GraphQL (Mercurius) API
│   ├── checkout-service/   # Go 1.22 + gRPC payment/checkout microservice
│   └── docs-site/          # Docusaurus v3 documentation
├── packages/
│   ├── ui/                 # React component library (Storybook, Tailwind)
│   ├── api-client/         # Generated TypeScript client (OpenAPI/GraphQL)
│   ├── config/             # Shared ESLint, Prettier, TSConfig, Tailwind
│   ├── database/           # Prisma schema + migrations + seed
│   ├── auth/               # Shared auth (JWT, sessions, RBAC, OAuth)
│   ├── testing/            # MSW handlers, RTL utils, Playwright fixtures
│   ├── validators/         # Zod schemas (shared validation)
│   └── utils/              # Shared utilities (date, format, crypto)
├── tools/
│   ├── generators/         # Nx generators (component, service, page)
│   ├── executors/          # Custom executors (deploy, test)
│   └── scripts/            # Build, release, migration scripts
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   └── CODEOWNERS          # Package/app ownership
├── nx.json                 # Nx workspace config
├── turbo.json              # Turborepo pipeline config
├── package.json            # Root package.json (pnpm workspaces)
├── pnpm-workspace.yaml     # Pnpm workspace config
├── tsconfig.base.json      # Base TypeScript config
└── .nvmrc                  # Node version (20.x)
```

## Requirements (requirements/)
See `requirements/` folder for:
- `functional.md` - User stories and acceptance criteria
- `non-functional.md` - Performance, security, DX, testability requirements

## Quick Start

### Prerequisites
```bash
# Enable pnpm (included with Node.js 16.9+)
corepack enable pnpm

# Or install specific version
corepack prepare pnpm@9.0.0 --activate
```

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Database
```bash
# Start PostgreSQL + Redis
docker-compose up -d postgres redis

# Run migrations
pnpm nx run database:migrate

# Seed development data
pnpm nx run database:seed
```

### 3. Start Development Servers
```bash
# Run all apps concurrently
pnpm nx run-many --target=dev --projects=web-store,admin-dashboard,mobile-api,checkout-service

# Or individually
pnpm nx dev web-store        # http://localhost:3000
pnpm nx dev admin-dashboard  # http://localhost:3001
pnpm nx dev mobile-api       # http://localhost:3002
pnpm nx dev checkout-service # http://localhost:3003 (gRPC)
```

### 4. Run SDET Pipeline
```bash
# Analyze requirements
/sdet-analyze --source ./requirements --format json

# Generate test cases
/sdet-generate --template standard --includeNegative --includeBoundary

# Validate test cases
/sdet-validate --strict

# Generate automation (all test types)
/sdet-automate --type ui,api,contract,visual --framework playwright,pactum,pact,chromatic

# Execute tests
/sdet-execute --type ui,api,contract --parallel 8 --retry 2

# Analyze results
/sdet-analyze-results --updateExcel --createDefects

# Generate CI/CD
/sdet-deploy --platform github-actions --qualityGates

# Full orchestration
/sdet-orchestrate --workflow full --autoApprove
```

## Key Features to Test

### Functional (Per App)
- **web-store**: SSR/ISR catalog, cart, checkout (Stripe), account, wishlist
- **admin-dashboard**: Product CRUD, order management, analytics, bulk operations
- **mobile-api**: GraphQL/REST, sparse fieldsets, WebSocket subscriptions, push
- **checkout-service**: Payment processing, refunds, idempotency, PCI compliance
- **docs-site**: Search, versioning, API reference, tutorials

### Cross-Cutting
- **Shared UI**: Component library (Button, Form, Modal, DataTable, Charts)
- **API Contracts**: OpenAPI + GraphQL schema, Pact contract tests
- **Database**: Prisma schema, migrations, multi-tenancy
- **Auth**: JWT (RS256), sessions, RBAC, OAuth providers
- **Design System**: Storybook, Chromatic visual regression, a11y

### Non-Functional
- **Build**: Incremental < 2min, cache hit > 80%, DTE
- **Performance**: Web Vitals (LCP < 2.5s), API p95 < 200ms
- **Security**: SAST/SCA/Secrets every PR, SLSA Level 2+, signed commits
- **Testability**: Affected test detection, parallel, sharding, flaky quarantine

## Test Scenarios

### Unit Tests (Jest/Vitest)
- **Per package**: Pure functions, hooks, utilities, validators
- **Components**: React Testing Library (ui package)
- **Services**: Business logic with mocked dependencies
- **Coverage**: > 80% per package

### Integration Tests
- **web-store**: MSW for API mocking, Next.js test utils
- **admin-dashboard**: MSW + React Router testing
- **mobile-api**: Testcontainers (PostgreSQL, Redis), Supertest
- **checkout-service**: Testcontainers, gRPC test client
- **Database**: Prisma test transactions, rollback per test

### E2E Tests (Playwright)
- **web-store**: Critical paths (browse → cart → checkout → account)
- **admin-dashboard**: Admin workflows (product CRUD, order management)
- **Cross-app**: Shared auth flow, cart sync
- **Sharding**: Duration-based, 4 workers

### Contract Tests (Pact)
- **Consumers**: web-store, admin-dashboard, mobile-app (external)
- **Providers**: mobile-api, checkout-service
- **Contracts**: OpenAPI (REST) + GraphQL schema
- **Broker**: Pactflow/Pact Broker, `can-i-deploy` gate

### Visual Regression (Chromatic)
- **ui package**: All components, all states, all themes
- **web-store**: Key pages (home, product, cart, checkout)
- **admin-dashboard**: Key pages (dashboard, product list, order detail)
- **Baseline**: Main branch, auto-update on approved PRs

### Performance Tests (k6)
- **web-store**: Lighthouse CI + k6 browser
- **mobile-api**: REST + GraphQL load (10K VU)
- **checkout-service**: Payment flow load (5K VU)
- **Thresholds**: Per-endpoint budgets in quality-gates.yaml

### Security Tests
- **SAST**: Semgrep + CodeQL (every PR)
- **SCA**: Trivy + Snyk (every build)
- **Secrets**: TruffleHog (every commit)
- **Container**: Grype (every image)
- **License**: FOSSA (weekly)

## CI/CD Pipeline (GitHub Actions + Nx Cloud)

### Pipeline Stages
```yaml
# .github/workflows/ci.yml
stages:
  1. affected:     # Nx affected detection (lint, typecheck, test, build)
  2. contract:     # Pact contract tests (providers + consumers)
  3. e2e:          # Playwright E2E (sharded, parallel)
  4. visual:       # Chromatic visual regression
  5. performance:  # k6 load tests (scheduled, not every PR)
  6. security:     # SAST, SCA, Secrets, Container, License
  7. deploy-preview: # Vercel (web), K8s preview (API)
  8. deploy-prod:  # Manual approval, phased rollout
```

### Nx Cloud Configuration
- **Distributed Task Execution**: 8-16 agents
- **Remote Cache**: Nx Cloud (free tier: 500 GB/month)
- **Flaky Detection**: Auto-quarantine, re-run
- **Insights**: Build time trends, test analytics

### Turborepo Alternative
```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "build/**"] },
    "test": { "dependsOn": ["build"], "outputs": ["coverage/**"] },
    "lint": { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true },
    "contract": { "dependsOn": ["build"] },
    "e2e": { "dependsOn": ["build"], "cache": false },
    "visual": { "dependsOn": ["build"] }
  }
}
```

## Quality Gates

### Per Package (Every PR)
- [ ] Lint: 0 errors (ESLint + Prettier)
- [ ] Typecheck: 0 errors (tsc --noEmit)
- [ ] Unit Tests: > 80% coverage, all pass
- [ ] Build: Success (outputs cached)

### Per App (Every PR)
- [ ] All package gates pass
- [ ] Integration Tests: Pass
- [ ] Contract Tests: Pass (Pact verified)
- [ ] Bundle Size: < Budget (webpack-bundle-analyzer)
- [ ] Visual Regression: No unapproved changes

### Pre-Merge (PR Requirements)
- [ ] All CI gates pass
- [ ] Reviews: 1 (packages), 2 (apps)
- [ ] CODEOWNERS approval for shared packages
- [ ] Linear history (squash merge)
- [ ] Conventional commits (feat:, fix:, chore:, etc.)

### Release (Main Branch)
- [ ] All gates pass on main
- [ ] Version bump via changesets
- [ ] Changelog auto-generated
- [ ] npm packages published (private registry)
- [ ] Container images built + signed (cosign)
- [ ] SBOM generated (Syft)
- [ ] Deploy triggered (ArgoCD/Vercel)

## Monorepo-Specific Testing Patterns

### Affected Testing
```bash
# Only test what changed
pnpm nx affected:test --parallel=4

# Test + build affected
pnpm nx affected --target=test,build --parallel=4

# With base/sha (CI)
pnpm nx affected --base=main --head=HEAD --target=test,build
```

### Cross-Package Impact Detection
```bash
# What apps affected by ui package change?
pnpm nx affected:apps --files=packages/ui/src/button.tsx

# What packages need rebuild?
pnpm nx affected:build --files=packages/database/prisma/schema.prisma
```

### Shared Test Utilities
```typescript
// packages/testing/src/msw-handlers.ts
export const handlers = [
  http.get('/api/products', () => HttpResponse.json(mockProducts)),
  http.post('/api/cart', () => HttpResponse.json({ success: true })),
];

// packages/testing/src/prisma-test.ts
export async function withTestDb<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
  const tx = await prisma.$transaction(async (tx) => {
    const result = await fn(tx);
    throw new Error('ROLLBACK'); // Always rollback
  }).catch(() => {}); // Ignore rollback error
  return tx;
}
```

## Release Management

### Changesets Workflow
```bash
# Create changeset (interactive)
pnpm changeset

# Version packages (CI)
pnpm changeset version

# Publish (CI)
pnpm changeset publish
```

### Release Types
- **Patch**: Bug fixes, internal changes (auto-deploy preview)
- **Minor**: New features, non-breaking API additions
- **Major**: Breaking changes (coordinated, release branch)

### Release Branches
- `release/v1.x` → `release/v2.x`
- Hotfixes: Cherry-pick to release branch
- Backports: `/sdet-backport --branches release/v1.x,release/v2.x`

## Monitoring & Observability

### CI/CD Metrics (Nx Cloud)
- Build time (p50, p95, trend)
- Test duration (unit, integration, e2e)
- Cache hit rate (target > 80%)
- Flaky test rate (target < 1%)
- Bundle size per app (trend)

### Production Monitoring
| App | Tool | Metrics |
|-----|------|---------|
| web-store | Vercel Analytics + GA4 | Core Web Vitals, conversions |
| admin-dashboard | Datadog RUM | Load time, errors, user actions |
| mobile-api | Datadog APM | RED metrics, traces |
| checkout-service | Datadog APM + Custom | Payment success rate, latency |

### Error Tracking
- **Sentry**: All apps (source maps uploaded in CI)
- **Alerting**: PagerDuty (P1), Slack (P2/P3)

## Security Checklist

- [ ] Dependabot: Weekly, auto-merge patch/minor
- [ ] CodeQL: Every PR + scheduled weekly
- [ ] Semgrep: Custom rules + registry
- [ ] TruffleHog: Pre-commit + CI
- [ ] SLSA: GitHub Actions attestations (provenance)
- [ ] Cosign: Container image signing
- [ ] SBOM: Syft per release
- [ ] CODEOWNERS: Enforced for shared packages
- [ ] Branch Protection: Required checks + reviews

## Running the Full SDET Pipeline

```bash
# Quick validation (PR-like)
/sdet-orchestrate --workflow quick --autoApprove

# CI pipeline (no analyze/generate)
/sdet-orchestrate --workflow ci --autoApprove

# Full pipeline with human gates
/sdet-orchestrate --workflow full

# Security-focused
/sdet-orchestrate --workflow security --autoApprove

# Performance-focused
/sdet-orchestrate --workflow performance --autoApprove

# Resume from checkpoint
/sdet-orchestrate --resume <runId>
```

## Troubleshooting

### Common Issues
| Issue | Solution |
|-------|----------|
| `pnpm install` fails | `corepack enable pnpm && pnpm install --frozen-lockfile` |
| Nx cache miss | Check `nx.json` namedInputs, ensure deterministic builds |
| TypeScript errors across packages | `pnpm nx run-many --target=typecheck --all` |
| Flaky E2E tests | Check `/sdet-flake --window 30 --action detect` |
| Visual regression failures | Review in Chromatic, update baseline if intentional |
| Contract test failures | Run `pnpm nx run mobile-api:contract` locally, check Pact broker |

### Debug Commands
```bash
# Show project graph
pnpm nx graph

# Show affected projects
pnpm nx show projects --affected

# Run single test file
pnpm nx run web-store:test -- --testPathPattern="cart"

# Debug build
pnpm nx run web-store:build --verbose
```