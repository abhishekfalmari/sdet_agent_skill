---
name: sdet-validate
description: Validate test cases for completeness and traceability
arguments:
  - name: file
    description: Path to test case Excel file
    required: false
  - name: strict
    description: Strict validation mode (fail on warnings)
    required: false
    default: false
  - name: checks
    description: Comma-separated checks to run (schema, traceability, coverage, quality, duplicates, all)
    required: false
    default: all
---

# SDET Validate Skill

## Context
You are an SDET quality reviewer. Validate test cases against standards and annotate results.

## Instructions
1. **Load context**: `node .claude/scripts/state-helpers.js load`
2. **Load test cases** from `{{file}}` or shared context (`sdet.testcases.path`)
3. **Validate context** has test cases: `node .claude/scripts/context-helpers.js validate validate`
4. **Parse checks** from `{{checks}}`:
   - `schema`: All required columns present, correct data types
   - `traceability`: Every test case links to requirement, no orphan test cases
   - `coverage`: Every requirement has at least one test case, type coverage per requirement
   - `quality`: Clear steps, specific expected results, test data provided, no vague assertions
   - `duplicates`: No duplicate test case IDs, no duplicate (requirement, action, expected) tuples
   - `automation`: Automation status consistent, automation IDs valid if automated
   - `all`: Run all checks above
5. **Execute validation checks**:
   - **Schema Check**: Verify all 19 required columns exist, data types match
   - **Traceability Check**: 
     - Every test case has ≥1 Requirement ID
     - All Requirement IDs exist in requirements artifact
     - No test cases without requirements
   - **Coverage Check**:
     - Every requirement has ≥1 test case
     - Each requirement has positive + negative (if applicable)
     - Security requirements have security test cases
     - Performance requirements have performance test cases
   - **Quality Check**:
     - Steps: ≥1 step, imperative mood, specific actions
     - Expected Results: Specific, measurable, verifiable
     - Test Data: Concrete values, not placeholders (unless parameterized)
     - Preconditions: Realistic, achievable
   - **Duplicates Check**:
     - Unique Test Case IDs
     - No duplicate (Requirement, Action, Expected Result) combinations
   - **Automation Check**:
     - Automation Status values valid
     - If automated, Automation ID references existing file
     - Automation Status consistent with test type
6. **Annotate Excel**: Add/Update columns:
   - `Validation Status`: PASS, FAIL, WARNING
   - `Validation Issues`: JSON array of issues per row
   - `Validation Timestamp`: ISO timestamp
7. **Generate validation report** (JSON):
   ```json
   {
     "summary": { "total": 100, "passed": 85, "warnings": 10, "failed": 5 },
     "byCheck": { "schema": {...}, "traceability": {...}, ... },
     "issues": [
       { "row": 5, "check": "quality", "severity": "error", "message": "Expected result is vague" }
     ],
     "recommendations": [...]
   }
   ```
8. **Save annotated Excel** to `artifacts/test-cases/test-cases-validated-{{timestamp}}.xlsx`
9. **Save validation report** to `artifacts/validation/validation-report-{{timestamp}}.json`
10. **If `{{strict}}` and failures exist**: Request human review, exit with error
11. **Update shared context**:
    ```javascript
    await saveContext('validate', {
      status: failedCount > 0 ? 'failed' : (warningCount > 0 ? 'warnings' : 'passed'),
      reportPath: reportPath,
      annotatedPath: annotatedPath,
      summary: { total, passed, warnings, failed }
    });
    ```

## Shared Context Keys
- `sdet.validation.status` (passed/failed/warnings)
- `sdet.validation.report.path`
- `sdet.validation.annotated.path`
- `sdet.validation.summary`

## Arguments Reference
- **file** (optional): Path to test case Excel file
- **strict** (optional): Strict validation mode - fail on warnings. Default: false
- **checks** (optional): Comma-separated checks - schema, traceability, coverage, quality, duplicates, automation, all. Default: all

## Output
- `artifacts/test-cases/test-cases-validated-<timestamp>.xlsx` (annotated)
- `artifacts/validation/validation-report-<timestamp>.json`
- Updated shared context with validation status

## Example Usage
```bash
/sdet-validate --file ./artifacts/test-cases/test-cases-standard-20240115.xlsx
/sdet-validate --strict true --checks schema,traceability,coverage
/sdet-validate --checks quality,duplicates
```

## Implementation Notes
- Use `node .claude/scripts/state-helpers.js load` to load context
- Use `node .claude/scripts/state-helpers.js save sdet-validate {...}` to save
- Use SheetJS for Excel reading/writing with annotation preservation
- Generate detailed, actionable error messages with row references
- Support custom validation rules via config file
- Track validation history for trend analysis