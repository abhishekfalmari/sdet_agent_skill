---
name: sdet-mask
description: Mask sensitive data for test environments
arguments:
  - name: regulations
    description: Compliance targets (gdpr, hipaa, pci, ccpa, sox, custom)
    required: false
    default: gdpr
  - name: mode
    description: Masking mode (deterministic, random, format-preserving, encryption)
    required: false
    default: deterministic
  - name: source
    description: Source data path (or 'auto' from sdet-data)
    required: false
    default: auto
  - name: customRules
    description: Custom masking rules file path
    required: false
---

# SDET Mask Skill

## Context
You are a Data Privacy Engineer. Ensure test data compliance with regulations.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Discover PII/PHI/PCI fields:
   - ML-based detection (NER, regex patterns, column name analysis)
   - Rule-based: email, ssn, credit card, phone, address, DOB, medical record numbers
   - Load from `sdet.data.paths[]` or {{source}}
2. Load {{regulations}} rules:
   - **GDPR**: Pseudonymization, right to erasure, data minimization, DPIA triggers
   - **HIPAA**: Safe Harbor (18 identifiers) / Expert Determination method
   - **PCI-DSS**: PAN masking (first 6, last 4), tokenization, CVV never stored
   - **CCPA**: Personal info categories, household data, inference data
   - **SOX**: Financial data, audit trail integrity
   - **Custom**: User-defined regex/patterns
3. Apply {{mode}} masking:
   - **Deterministic**: Same input → same output (referential integrity for joins)
   - **Random**: Different each run (higher privacy, breaks referential integrity)
   - **Format-preserving**: Valid format (Luhn for cards, valid email, SSN format)
   - **Encryption**: Reversible with key management (for re-identification if needed)
4. Verify:
   - No PII leakage (re-scan masked data)
   - Referential integrity maintained (FK relationships valid)
   - Statistical properties preserved (distributions, cardinality)
   - Format validity (emails parse, cards pass Luhn)
5. Output:
   - Masked datasets in `artifacts/test-data/masked/`
   - Masking audit log (field, original type, method, sample)
   - Compliance report per regulation
   - Re-identification key (if encryption mode, stored securely)
6. Update shared context

## Shared Context Keys
- `sdet.mask.path` (masked data root)
- `sdet.mask.audit.path` (audit log)
- `sdet.mask.rules.applied[]` (per field: regulation, method, sample)
- `sdet.mask.compliance[]` (per regulation: passed, findings)
- `sdet.mask.reidentificationKey.path` (if encryption mode)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| regulations | string | false | gdpr | Compliance targets (gdpr, hipaa, pci, ccpa, sox, custom) |
| mode | string | false | deterministic | Masking mode (deterministic, random, format-preserving, encryption) |
| source | string | false | auto | Source data path |
| customRules | string | false | | Custom masking rules file path |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-mask '{"path":"","auditPath":"","rulesApplied":[],"compliance":[],"reidentificationKeyPath":""}'
```

## Output
- Masked datasets
- Masking audit log
- Compliance reports
- Re-identification key (encrypted)