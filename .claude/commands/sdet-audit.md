---
name: sdet-audit
description: Package audit evidence for compliance audits
arguments:
  - name: standard
    description: Audit standard (sox, iso27001, soc2, hipaa, gdpr, fda-21cfr11, pci-dss, custom)
    required: false
    default: soc2
  - name: period
    description: "Audit period (quarter, year, custom range: YYYY-MM-DD:YYYY-MM-DD)"
    required: false
    default: quarter
  - name: outputFormat
    description: Output format (zip, folder, confluence, sharepoint, s3)
    required: false
    default: zip
---

# SDET Audit Skill

## Context
You are an Audit Engineer. Produce auditor-ready evidence packages.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load all test artifacts, defects, changes, approvals for {{period}} from context:
   - Test plans: `sdet.plan.path`, approvals, sign-offs
   - Test execution: `sdet.execution.results.path`, `sdet.execution.summary` (immutable logs)
   - Test cases: `sdet.testcases.path`, `sdet.validation.annotated.path`
   - Automation: `sdet.automation.files[]`, code review records
   - Results analysis: `sdet.results.updatedExcel.path`, `sdet.results.traceability.path`
   - Defects: `sdet.defect.created[]`, `sdet.defect.verified[]`, `sdet.defect.closed[]`, `sdet.defect.report.path`
   - Coverage: `sdet.coverage.code`, `sdet.coverage.requirement`, reports
   - Security: `sdet.security.findings[]`, `sdet.security.by-severity`, remediation
   - Accessibility: `sdet.accessibility.violations[]`, `sdet.accessibility.vpat.path`
   - Compliance: `sdet.compliance.report.path`, `sdet.compliance.evidence.path`
   - Environments: `sdet.env.url`, `sdet.env.status`, access logs
   - Data: `sdet.mask.audit.path`, `sdet.seed.verification[]`
   - Deployments: `sdet.pipeline.path`, deployment records, rollback drills
   - Governance: `sdet.governance.violations[]`, `sdet.governance.score`, exceptions
   - Monitoring: `sdet.monitor.checks[]`, `sdet.monitor.alerts[]`, incident response
2. Map to {{standard}} control objectives:
   - **SOX**: Change management (test approval, code review, deployment gates), access control, monitoring, data integrity
   - **ISO 27001**: ISMS, risk treatment, controls (A.8-A.18), internal audit, management review
   - **SOC 2**: Security, Availability, Processing Integrity, Confidentiality, Privacy (Trust Services Criteria)
   - **HIPAA**: PHI encryption, access control, audit logs, BAA, minimum necessary, breach notification
   - **GDPR**: Lawful basis, consent, DSR, DPIA, breach notification, DPO, data processing agreements
   - **FDA 21 CFR Part 11**: Electronic signatures, audit trails, validation, access control, record retention
   - **PCI-DSS**: Network segmentation, encryption, access control, monitoring, testing, vulnerability management
3. Package evidence per control:
   - **Test plans + approvals**: Signed PDFs, reviewer identities, timestamps
   - **Test execution logs**: Immutable (hash-verified), complete (no gaps), timestamped
   - **Defect tracking + resolution**: Full lifecycle, root cause, fix verification, closure approval
   - **Coverage reports + trends**: Historical, threshold compliance, gap remediation
   - **Security scan results**: Tool, version, configuration, findings, remediation status
   - **Access logs + reviews**: Environment access, data access, periodic review records
   - **Change records**: Deployment tickets, test gates passed, rollback capability verified
   - **Incident response**: Detection, response, resolution, postmortem, prevention
4. Format {{outputFormat}}:
   - **ZIP**: Index.html, manifest.json (SHA256), evidence/, reader-guide.pdf
   - **Folder**: Structured directory per control domain
   - **Confluence**: Space with page tree, attachments, macros
   - **SharePoint**: Document library with metadata, retention labels
   - **S3**: Versioned bucket, lifecycle policy, access logging
5. Output:
   - Audit evidence package ({{outputFormat}})
   - Control mapping matrix (control → evidence → test artifact)
   - Completeness checklist (required vs provided)
   - Auditor guide (navigation, terminology, contact)
6. Update shared context

## Shared Context Keys
- `sdet.audit.package.path`
- `sdet.audit.matrix.path`
- `sdet.audit.controls[]` (controlId, description, evidence[], status, gaps[])
- `sdet.audit.checklist` (required, provided, missing, completeness%)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| standard | string | false | soc2 | Audit standard |
| period | string | false | quarter | Audit period |
| outputFormat | string | false | zip | Output format |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-audit '{"packagePath":"","matrixPath":"","controls":[],"checklist":{}}'
```

## Output
- Audit evidence package
- Control mapping matrix
- Completeness checklist
- Auditor navigation guide