---
name: sdet-generate
description: Generate Excel test cases from structured requirements
arguments:
  - name: template
    description: Template type (standard, api, security, performance, accessibility, mobile, exploratory, compliance, test-plan)
    required: false
    default: standard
  - name: includeNegative
    description: Include negative test cases
    required: false
    default: true
  - name: includeBoundary
    description: Include boundary value analysis test cases
    required: false
    default: true
  - name: includeEdgeCases
    description: Include edge case test cases
    required: false
    default: true
  - name: testDataStrategy
    description: Test data approach (synthetic, reference, masked, fixture)
    required: false
    default: synthetic
---

# SDET Generate Skill

## Context
You are an SDET test designer. Create comprehensive test cases in Excel from structured requirements.

## Instructions
1. **Load context**: `node .sdet-skills/scripts/state-helpers.js load`
2. **Load requirements** from shared context (`sdet.requirements.path`) or `artifacts/requirements/`
3. **Validate context** has requirements: `node .sdet-skills/scripts/context-helpers.js validate generate`
4. **Select template** (`{{template}}`):
   - `standard`: General functional test cases
   - `api`: API-specific (endpoint, method, payload, response)
   - `security`: Security-focused (OWASP categories, attack vectors)
   - `performance`: Performance (load, stress, thresholds)
   - `accessibility`: WCAG criteria, assistive tech scenarios
   - `mobile`: Platform-specific (iOS/Android, gestures, permissions)
   - `exploratory`: Charter-based, session notes structure
   - `compliance`: Regulatory mapping, evidence columns
   - `test-plan`: High-level test plan structure
5. **Load template** from `templates/excel/{{template}}.xlsx`
6. **For each requirement**, generate test cases:
   - **Positive/Happy Path** (always): 1-3 cases per acceptance criterion
   - **Negative** (if `{{includeNegative}}`): Invalid inputs, error handling, missing data
   - **Boundary** (if `{{includeBoundary}}`): Min, max, off-by-one, empty, null
   - **Edge Cases** (if `{{includeEdgeCases}}`): Race conditions, timeouts, concurrency
   - **Security** (for security requirements): Injection, auth bypass, data exposure
   - **Performance** (for perf requirements): Load, latency, throughput thresholds
   - **Accessibility** (for a11y requirements): Keyboard, screen reader, contrast
7. **Apply test data strategy** (`{{testDataStrategy}}`):
   - `synthetic`: Generate realistic fake data
   - `reference`: Use production-like reference data
   - `masked`: Use masked production data
   - `fixture`: Use predefined fixture datasets
8. **Populate standard columns**:
   | Column | Description |
   |--------|-------------|
   | Test Case ID | Unique identifier (TC-XXX) |
   | Requirement ID(s) | Linked requirement IDs |
   | Title | Concise test case name |
   | Description | Detailed description |
   | Type | positive, negative, boundary, security, performance, accessibility, edge |
   | Priority | critical, high, medium, low |
   | Preconditions | Setup steps required |
   | Step # | Step number |
   | Action | Action to perform |
   | Test Data | Input data values |
   | Expected Result | Expected outcome |
   | Automation Status | manual, planned, automated, deprecated |
   | Automation ID | Link to automation code |
   | Tags | Comma-separated tags |
   | Estimated Duration (min) | Estimated execution time |
   | Created By | Author |
   | Created Date | Creation timestamp |
   | Last Modified | Last update timestamp |
   | Status | draft, review, approved, executed |
   | Notes | Additional notes |
9. **Save Excel** to `artifacts/test-cases/test-cases-{{template}}-{{timestamp}}.xlsx`
10. **Update shared context**:
    ```javascript
    await saveContext('generate', {
      count: testCases.length,
      path: outputPath,
      template: '{{template}}',
      byType: typeCounts,
      byPriority: priorityCounts
    });
    ```

## Shared Context Keys
- `sdet.testcases.count`
- `sdet.testcases.path`
- `sdet.testcases.template`
- `sdet.testcases.byType`
- `sdet.testcases.byPriority`

## Arguments Reference
- **template** (optional): Template type - standard, api, security, performance, accessibility, mobile, exploratory, compliance, test-plan. Default: standard
- **includeNegative** (optional): Include negative test cases. Default: true
- **includeBoundary** (optional): Include boundary value analysis. Default: true
- **includeEdgeCases** (optional): Include edge case test cases. Default: true
- **testDataStrategy** (optional): Test data approach - synthetic, reference, masked, fixture. Default: synthetic

## Output
- `artifacts/test-cases/test-cases-<template>-<timestamp>.xlsx`
- Updated shared context with test case metadata

## Example Usage
```bash
/sdet-generate --template standard --includeNegative true --includeBoundary true
/sdet-generate --template security --testDataStrategy masked
/sdet-generate --template api --includeEdgeCases true
```

## Implementation Notes
- Use `node .sdet-skills/scripts/state-helpers.js load` to load context
- Use `node .sdet-skills/scripts/state-helpers.js save sdet-generate {...}` to save
- Use SheetJS (xlsx) library for Excel manipulation
- Preserve template formatting, styles, and formulas
- Generate traceability links (Requirement ID → Test Case IDs)
- Support batch generation for large requirement sets