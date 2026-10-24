---
name: sdet-contract
description: Consumer-driven contract testing (Pact, Spring Cloud Contract)
arguments:
  - name: framework
    description: Contract framework (pact, spring-cloud-contract, pactflow, custom)
    required: false
    default: pact
  - name: role
    description: Role (consumer, provider, both, broker)
    required: false
    default: both
  - name: brokerUrl
    description: Pact Broker URL (for pactflow/pact-broker)
    required: false
  - name: publish
    description: Publish contracts to broker
    required: false
    default: true
---

# SDET Contract Skill

## Context
You are a Contract Testing Engineer. Prevent integration failures.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load API consumers/providers from context:
   - `sdet.requirements.path` (service contracts, API specs)
   - `sdet.automation.files[]` (existing API tests)
   - `sdet.service-map.graph` (service topology)
2. For {{role}}:
   - **Consumer**: Generate contract tests (Pact DSL, Spring Cloud Contract Groovy/DSL)
     - Define expected provider interactions (request/response)
     - Run consumer tests against mock provider
     - Generate contract file (JSON for Pact, JAR for Spring Cloud Contract)
   - **Provider**: Verify against published contracts
     - Pull contracts from broker or local files
     - Run provider verification (real provider, mocked consumers)
     - Publish verification results
   - **Broker**: Publish/verify via Pactflow/Pact Broker
     - `pact-broker publish` / `can-i-deploy`
     - Webhooks for contract changes
     - Matrix of compatibility
3. Workflow:
   - Consumer writes tests → generates contract → publishes to broker
   - Provider pulls contract → verifies → publishes result
   - Broker: Compatibility matrix, `can-i-deploy` gate
   - CI Integration:
     - Consumer: Publish on merge to main
     - Provider: Verify on PR + scheduled (nightly)
     - Webhook: Notify on contract changes (Slack, Teams)
4. For {{framework}}:
   - **Pact**: Ruby, JVM, .NET, JavaScript, Go, Python, Rust, Swift
   - **Spring Cloud Contract**: JVM only, Groovy/DSL, Stub Runner
   - **Pactflow**: Hosted broker, UI, analytics, bi-directional contracts
5. Output:
   - Contract files in `artifacts/contracts/{{consumer}}-{{provider}}/`
   - Verification results (JUnit XML, JSON)
   - Compatibility matrix (HTML, JSON)
   - `can-i-deploy` status for each version
6. Update shared context

## Shared Context Keys
- `sdet.contract.consumer[]` (consumer name, contract path, version)
- `sdet.contract.provider[]` (provider name, verification result, version)
- `sdet.contract.matrix` (compatibility matrix: consumer × provider × version)
- `sdet.contract.brokerUrl` (Pact Broker URL)
- `sdet.contract.canDeploy[]` (deployment decisions)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| framework | string | false | pact | Contract framework (pact, spring-cloud-contract, pactflow, custom) |
| role | string | false | both | Role (consumer, provider, both, broker) |
| brokerUrl | string | false | | Pact Broker URL |
| publish | boolean | false | true | Publish contracts to broker |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-contract '{"consumer":[],"provider":[],"matrix":{},"brokerUrl":"","canDeploy":[]}'
```

## Output
- Contract files (JSON/JAR)
- Verification results
- Compatibility matrix
- Deployment readiness (can-i-deploy)