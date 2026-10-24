---
name: sdet-mock
description: Generate and deploy service virtualization / mock servers
arguments:
  - name: tool
    description: Mock tool (wiremock, mockserver, prism, localstack, testcontainers, custom)
    required: false
    default: wiremock
  - name: mode
    description: Mode (record, generate, hybrid, proxy)
    required: false
    default: hybrid
  - name: specs
    description: API specs path (OpenAPI, AsyncAPI, Protobuf, GraphQL)
    required: false
    default: auto
  - name: deploy
    description: Deployment target (docker, k8s, standalone, compose)
    required: false
    default: docker
---

# SDET Mock Skill

## Context
You are a Service Virtualization Engineer. Decouple test execution from dependencies.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Identify external dependencies from context:
   - APIs: `sdet.requirements.path` (external integrations), `sdet.automation.files[]` (API calls)
   - Databases: Connection strings in configs
   - Message queues: Kafka, RabbitMQ, SQS topics
   - 3rd party: Payment gateways, auth providers, email/SMS services
2. For each dependency, apply {{mode}}:
   - **Record**: Capture real traffic via proxy (mitmproxy, WireMock recording)
   - **Generate**: Create from {{specs}} (OpenAPI, AsyncAPI, Protobuf, GraphQL SDL)
   - **Hybrid**: Record + enhance with edge cases (errors, timeouts, rate limits)
   - **Proxy**: Forward to real service, record/modify responses
3. Generate {{tool}} configurations:
   - **WireMock**: JSON mappings + Java extensions for dynamic responses
   - **MockServer**: JavaScript/JSON expectations with templating
   - **Prism**: OpenAPI-driven mock with validation
   - **LocalStack**: AWS service emulation (S3, DynamoDB, Lambda, SQS, etc.)
   - **Testcontainers**: Containerized dependencies (DB, Kafka, Redis, etc.)
   - **Custom**: Node.js/Express, Python/FastAPI mock servers
4. Add chaos/resilience patterns:
   - Latency injection (fixed, random, percentile-based)
   - Error injection (HTTP 5xx, 4xx, connection reset, timeout)
   - Rate limiting simulation
   - Data corruption (malformed JSON, missing fields)
   - State simulation (idempotency, sequencing)
5. Deploy to {{deploy}}:
   - Docker: Single container with config volume
   - K8s: Deployment + Service + ConfigMap
   - Standalone: JAR/binary with config
   - Compose: Multi-service with dependencies
6. Output:
   - Mock server configs in `artifacts/mocks/{{tool}}/`
   - Startup scripts (Dockerfile, docker-compose.yml, K8s manifests)
   - Verification tests (contract tests against mock)
   - Documentation (endpoints, scenarios, chaos config)
7. Update shared context

## Shared Context Keys
- `sdet.mock.services[]` (service name, type, endpoint)
- `sdet.mock.configs[]` (per service config path)
- `sdet.mock.endpoints[]` (mock URL, real URL, scenarios)
- `sdet.mock.deployment.path` (docker-compose/k8s manifests)
- `sdet.mock.verificationTests[]` (contract test paths)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| tool | string | false | wiremock | Mock tool (wiremock, mockserver, prism, localstack, testcontainers, custom) |
| mode | string | false | hybrid | Mode (record, generate, hybrid, proxy) |
| specs | string | false | auto | API specs path |
| deploy | string | false | docker | Deployment target (docker, k8s, standalone, compose) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-mock '{"services":[],"configs":[],"endpoints":[],"deploymentPath":"","verificationTests":[]}'
```

## Output
- Mock server configurations
- Deployment manifests
- Verification tests
- Chaos/resilience scenarios