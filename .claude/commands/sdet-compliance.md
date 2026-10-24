---
name: sdet-compliance
description: Regulatory compliance testing (GDPR, HIPAA, PCI, SOX, FDA, custom)
arguments:
  - name: regulation
    description: Regulation (gdpr, hipaa, pci-dss, sox, fda-21cfr11, iso27001, soc2, custom)
    required: false
    default: gdpr
  - name: evidence
    description: Generate audit evidence package
    required: false
    default: true
  - name: scope
    description: Scope (full, delta, specific-control)
    required: false
    default: full
---

# SDET Compliance Skill

## Context
You are a Compliance Engineer. Validate regulatory requirements through testing.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load system architecture, data flows, controls from context:
   - `sdet.service-map.graph` (service topology, data flows)
   - `sdet.data.paths[]` (test data, masking status)
   - `sdet.security.findings[]` (security scan results)
   - `sdet.accessibility.violations[]` (a11y status)
   - `sdet.mask.audit.path` (data masking audit)
   - Infrastructure configs (IaC, K8s, cloud)
2. Map {{regulation}} requirements to testable criteria:
   - **GDPR**: Lawful basis, consent, DSR (access, rectification, erasure, portability), DPIA, breach notification (72h), DPO, records of processing (ROPA), international transfers
   - **HIPAA**: PHI encryption (at rest, in transit), access control (unique ID, emergency access), audit logs (6 years), BAA, minimum necessary, workforce training, contingency plan
   - **PCI-DSS**: Network segmentation, encryption (TLS 1.2+), access control (need-to-know, MFA), monitoring (SIEM, FIM), testing (pen test, vuln scan), policy, incident response
   - **SOX**: Change control (segregation, approval), access reviews (quarterly), audit trails (immutable), segregation of duties, financial reporting controls
   - **FDA 21 CFR Part 11**: Electronic signatures (unique, non-repudiation), audit trails (timestamp, user, action), validation (IQ/OQ/PQ), record retention, system access
   - **ISO 27001**: ISMS, risk treatment, Annex A controls, internal audit, management review, continuous improvement
   - **SOC 2**: Security, Availability, Processing Integrity, Confidentiality, Privacy (Trust Services Criteria)
   - **Custom**: User-defined controls mapped to test cases
3. Generate compliance test cases per requirement:
   - Automated checks (config, code, runtime)
   - Manual verification steps (process, documentation, interview)
   - Evidence collection (screenshots, logs, configs, attestations)
4. Execute {{scope}}:
   - **Full**: All controls
   - **Delta**: Changed controls since last assessment
   - **Specific-control**: Single control ID
5. If {{evidence}}: Package audit evidence:
   - Test plans + approvals
   - Test execution logs (immutable)
   - Defect tracking + resolution
   - Coverage reports + trends
   - Security scan results
   - Access logs + reviews
   - Change control records
6. Output:
   - Compliance report (per control: pass/fail/partial, evidence ref)
   - Evidence package (ZIP with index, checksums, reader guide)
   - Gap remediation plan (control, gap, risk, fix, owner, date)
   - Attestation letter template
7. Update shared context

## Shared Context Keys
- `sdet.compliance.report.path` (compliance report)
- `sdet.compliance.evidence.path` (evidence package)
- `sdet.compliance.gaps[]` (control, gap, risk, remediation)
- `sdet.compliance.attestation.path` (signed attestation)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| regulation | string | false | gdpr | Regulation (gdpr, hipaa, pci-dss, sox, fda-21cfr11, iso27001, soc2, custom) |
| evidence | boolean | false | true | Generate audit evidence package |
| scope | string | false | full | Scope (full, delta, specific-control) |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-compliance '{"reportPath":"","evidencePath":"","gaps":[],"attestationPath":""}'
```

## Output
- Compliance report per regulation
- Audit evidence package (ZIP)
- Gap remediation plan
- Attestation letter