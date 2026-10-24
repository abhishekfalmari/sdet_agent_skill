---
name: sdet-api-fuzz
description: API fuzzing for robustness and security
arguments:
  - name: tool
    description: Fuzzing tool (restler, schemathesis, fuzzapi, custom)
    required: false
    default: schemathesis
  - name: mode
    description: Fuzzing mode (structure, grammar, mutation, generative, ml, stateful)
    required: false
    default: generative
  - name: spec
    description: API spec path (OpenAPI, GraphQL, gRPC proto)
    required: false
    default: auto
  - name: duration
    description: Fuzzing duration (minutes)
    required: false
    default: 30
---

# SDET API Fuzz Skill

## Context
You are an API Security Engineer. Find crashes, 500s, logic bugs via fuzzing.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load API spec from context:
   - `sdet.requirements.path` (API requirements)
   - `sdet.automation.files[]` (existing API tests)
   - {{spec}} file or auto-discover from project (swagger.json, schema.graphql, proto files)
2. Configure {{tool}} with {{mode}}:
   - **RESTler**: Grammar-based, OpenAPI, stateful fuzzing, compiler-based
   - **Schemathesis**: Property-based, OpenAPI/GraphQL, Hypothesis integration
   - **Fuzzapi**: OpenAPI fuzzer, CI-friendly, HTML reports
   - **Custom**: Proprietary fuzzers, protocol-specific
   - **Modes**:
     - **structure**: Valid schema, invalid values (type, format, range)
     - **grammar**: Protocol grammar (HTTP, GraphQL, gRPC)
     - **mutation**: Mutate valid requests (bitflip, insertion, deletion)
     - **generative**: ML-generated from examples (GPT, custom models)
     - **stateful**: Multi-request sequences with state (auth → create → read → delete)
3. Fuzz categories per endpoint:
   - **Input validation**: Bounds, types, format, enum, regex, required fields
   - **Auth/Authorization**: Token manipulation, privilege escalation, IDOR
   - **Injection**: SQL, NoSQL, command, LDAP, XSS, XXE, template
   - **Business logic**: Race conditions, state corruption, workflow bypass
   - **Resource exhaustion**: Large payloads, deep nesting, recursion, pagination
   - **Protocol edge cases**: Chunked encoding, header smuggling, HTTP/2
4. Run with coverage feedback (grey-box):
   - Instrument code for coverage (if accessible)
   - Prioritize inputs that increase coverage
   - Track unique paths/errors discovered
5. For {{duration}} minutes or until budget exhausted
6. Output:
   - Crashing inputs (minimized via delta debugging)
   - Unique error signatures (stack trace grouping)
   - Bug reports with reproduction steps
   - Coverage report (code paths, API operations)
   - Fuzzing corpus (for regression)
7. Update shared context

## Shared Context Keys
- `sdet.api-fuzz.findings[]` (crash, error, logic bug with reproduction)
- `sdet.api-fuzz.crashes[]` (minimized test cases)
- `sdet.api-fuzz.coverage` (operations covered, code coverage if available)
- `sdet.api-fuzz.corpus.path` (saved corpus for regression)
- `sdet.api-fuzz.duration` (actual run time)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| tool | string | false | schemathesis | Fuzzing tool (restler, schemathesis, fuzzapi, custom) |
| mode | string | false | generative | Fuzzing mode (structure, grammar, mutation, generative, ml, stateful) |
| spec | string | false | auto | API spec path |
| duration | number | false | 30 | Fuzzing duration (minutes) |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-api-fuzz '{"findings":[],"crashes":[],"coverage":0,"corpusPath":"","duration":0}'
```

## Output
- Fuzzing report with findings
- Minimized crashing test cases
- Bug reproduction scripts
- Coverage analysis
- Regression corpus