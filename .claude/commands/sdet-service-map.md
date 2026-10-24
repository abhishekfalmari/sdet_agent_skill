---
name: sdet-service-map
description: Discover service topology and test impact analysis
arguments:
  - name: source
    description: Discovery source (traces, mesh, k8s, api-gateway, manual)
    required: false
    default: traces
  - name: action
    description: Action (discover, map, impact, visualize, monitor, all)
    required: false
    default: all
  - name: outputFormat
    description: Output format (mermaid, graphviz, d3, json, cytoscape)
    required: false
    default: mermaid
---

# SDET Service Map Skill

## Context
You are a System Architect. Understand test impact across microservices.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Discover topology from {{source}}:
   - **Traces**: OpenTelemetry, Jaeger, Zipkin, Tempo - analyze spans for service calls
   - **Service mesh**: Istio (Kiali), Linkerd, Consul Connect - extract service graph
   - **K8s**: Services, Ingress, NetworkPolicies, EndpointSlices - cluster topology
   - **API Gateway**: Kong, Apigee, AWS API Gateway, Envoy - routes and upstreams
   - **Manual**: Architecture docs, OpenAPI specs, dependency manifests
2. Build graph: Services → APIs → Databases → Queues → External dependencies
   - Nodes: Service name, version, owner, criticality, SLOs
   - Edges: Call frequency, latency p50/p99, error rate, protocol
   - Metadata: Deployment env, team, repo, runtime, data classification
3. For {{action}}:
   - **discover**: Run discovery, output raw topology data
   - **map**: Build normalized service map with metadata
   - **impact**: Code change → affected services → required tests (blast radius)
   - **visualize**: Generate {{outputFormat}} visualization
   - **monitor**: Set up drift detection, new service alerts, topology change notifications
   - **all**: Run full pipeline
4. Impact analysis algorithm:
   - Direct dependencies (call graph traversal)
   - Data dependencies (shared databases, event streams)
   - Infrastructure dependencies (shared clusters, networks)
   - Test selection: Map changed files → services → integration/e2e tests
5. Output:
   - Service map ({{outputFormat}})
   - Impact matrix (change → tests mapping)
   - Test selection recommendations per PR
   - Drift detection config
6. Update shared context

## Shared Context Keys
- `sdet.service-map.graph` (nodes, edges, metadata)
- `sdet.service-map.impact[]` (changeId, affectedServices[], requiredTests[], blastRadius)
- `sdet.service-map.visualization.path`
- `sdet.service-map.drift.config`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| source | string | false | traces | Discovery source (traces, mesh, k8s, api-gateway, manual) |
| action | string | false | all | Action (discover, map, impact, visualize, monitor, all) |
| outputFormat | string | false | mermaid | Output format (mermaid, graphviz, d3, json, cytoscape) |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-service-map '{"graph":{},"impact":[],"visualizationPath":"","driftConfig":{}}'
```

## Output
- Service topology map
- Impact analysis matrix
- Visualization files
- Drift detection configuration