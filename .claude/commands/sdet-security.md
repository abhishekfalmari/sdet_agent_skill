---
name: sdet-security
description: Security testing (SAST, DAST, IAST, SCA, secrets, compliance)
arguments:
  - name: type
    description: Security type (sast, dast, iast, sca, secrets, container, iac, all)
    required: false
    default: all
  - name: standard
    description: Standard (owasp-top10, owasp-api, cwe, sans, nist, custom)
    required: false
    default: owasp-top10
  - name: severity
    description: Minimum severity (critical, high, medium, low, info)
    required: false
    default: medium
---

# SDET Security Skill

## Context
You are an Application Security Engineer. Shift-left security testing.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load codebase, dependencies, running app, API specs from context:
   - `sdet.automation.files[]` (test code to scan)
   - Source code from project root
   - `sdet.env.url` (running app for DAST)
   - `sdet.mock.services[]` (mocked dependencies)
   - Dependency manifests (package.json, pom.xml, go.mod, requirements.txt)
   - Container images (Dockerfile, docker-compose.yml)
   - IaC files (Terraform, K8s manifests, CloudFormation)
2. Run {{type}} scans:
   - **SAST**: Semgrep (rulesets), CodeQL (queries), SonarQube, Checkmarx, Fortify
     - Custom rules for business logic, crypto, auth
     - Incremental scans on PR, full on schedule
   - **DAST**: OWASP ZAP (active/passive), Burp Suite, Nikto, Arachni
     - Spider + active scan on {{sdet.env.url}}
     - Authenticated scans (import session/auth)
     - API scan (OpenAPI import)
   - **IAST**: Contrast, Seeker, Hdiv (instrumented runtime)
     - Requires agent in test environment
     - Correlates SAST + DAST findings
   - **SCA**: Trivy, Snyk, Dependabot, OWASP Dependency Check, CycloneDX
     - License compliance, vulnerability DB (NVD, GHSA)
     - Transitive dependencies, reachability analysis
   - **Secrets**: TruffleHog, GitLeaks, detect-secrets, GitGuardian
     - Code + history (git log --all)
     - Entropy-based + pattern-based
     - Verification (active/inactive)
   - **Container**: Trivy, Grype, Syft, Docker Scout
     - Base image, layers, packages, config
     - SBOM generation (SPDX, CycloneDX)
   - **IaC**: Checkov, tfsec, kics, Terrascan, OPA
     - Terraform, K8s, CloudFormation, ARM, Helm
     - Policy as code (custom Rego)
3. Map findings to {{standard}}:
   - OWASP Top 10 (A01-A10)
   - OWASP API Top 10
   - CWE Top 25
   - SANS Top 25
   - NIST 800-53
4. Prioritize: CVSS × exploitability × reachability × business impact
5. Output:
   - SARIF (GitHub Code Scanning, Azure DevOps)
   - JSON (CI integration)
   - HTML (detailed report with remediation)
   - CycloneDX SBOM
   - PR comments with findings
6. Update shared context

## Shared Context Keys
- `sdet.security.findings[]` (tool, type, severity, location, cwe, owasp, fix)
- `sdet.security.by-severity` (counts per severity)
- `sdet.security.remediation[]` (finding, fix, effort, priority)
- `sdet.security.sbom.path` (CycloneDX/SPDX)
- `sdet.security.compliance[]` (standard, passed, findings)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string | false | all | Security type (sast, dast, iast, sca, secrets, container, iac, all) |
| standard | string | false | owasp-top10 | Standard (owasp-top10, owasp-api, cwe, sans, nist, custom) |
| severity | string | false | medium | Minimum severity |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-security '{"findings":[],"bySeverity":{},"remediation":[],"sbomPath":"","compliance":[]}'
```

## Output
- Security scan reports (SARIF, JSON, HTML)
- SBOM (CycloneDX/SPDX)
- Remediation guidance with PRs
- Compliance mapping