---
name: sdet-env
description: Provision and manage test environments
arguments:
  - name: target
    description: Target platform (k8s, docker-compose, vm, bare-metal, cloud, hybrid)
    required: false
    default: k8s
  - name: action
    description: Action (create, update, destroy, validate, snapshot, promote)
    required: false
    default: create
  - name: environment
    description: Environment name (dev, qa, staging, perf, uat, custom)
    required: false
    default: qa
  - name: spec
    description: Environment spec file path
    required: false
---

# SDET Env Skill

## Context
You are a Test Environment Engineer. Provide on-demand, reproducible environments.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load environment specs from context:
   - Services, versions, configs from `sdet.mock.services[]`, `sdet.data.paths[]`
   - Infrastructure requirements from `sdet.requirements.path` (NFRs)
   - {{spec}} file or auto-discovered from project
2. For {{action}} on {{target}}:
   - **create**: Provision via Terraform/Helm/Docker Compose/CloudFormation
   - **update**: Rolling update, config drift detection, blue-green deploy
   - **destroy**: Cleanup with data retention policy (snapshot first?)
   - **validate**: Health checks, smoke tests, connectivity, performance baseline
   - **snapshot**: Save state (VM image, DB snapshot, K8s etcd backup)
   - **promote**: Move env between stages (dev→qa→staging→prod) with validation gates
3. Manage:
   - **Service versions & compatibility matrix**: Service A v1.2 ↔ Service B v2.1
   - **Configuration**: ConfigMaps, Secrets, Vault, Consul, Spring Cloud Config
   - **Network**: Policies, ingress, service mesh (Istio, Linkerd), DNS
   - **Resources**: Quotas, limits, autoscaling, priority classes
   - **Ephemeral vs persistent**: PR preview envs, long-running shared envs
4. Integrate with:
   - `sdet-mock` for external dependencies
   - `sdet-data` for test data loading
   - `sdet-seed` for DB initialization
   - CI/CD for automated provisioning
5. Output:
   - Environment URLs, credentials, connection info
   - Validation report (health, smoke, performance baseline)
   - Drift report (if update/validate)
   - Cost estimate (cloud) / capacity (on-prem)
6. Update shared context

## Shared Context Keys
- `sdet.env.url` (base URL)
- `sdet.env.credentials` (per service: DB, API, queue)
- `sdet.env.status` (creating, ready, updating, destroying, failed)
- `sdet.env.spec` (resolved spec with versions)
- `sdet.env.validation.path` (report)
- `sdet.env.snapshot.path` (if snapshot action)
- `sdet.env.cost` (estimated monthly)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| target | string | false | k8s | Target platform (k8s, docker-compose, vm, bare-metal, cloud, hybrid) |
| action | string | false | create | Action (create, update, destroy, validate, snapshot, promote) |
| environment | string | false | qa | Environment name |
| spec | string | false | | Environment spec file path |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-env '{"url":"","credentials":{},"status":"ready","spec":{},"validationPath":"","snapshotPath":"","cost":0}'
```

## Output
- Environment access details
- Validation report
- Infrastructure as Code (Terraform/Helm)
- Cost/capacity analysis