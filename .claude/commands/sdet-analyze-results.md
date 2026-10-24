---
name: sdet-analyze-results
description: Analyze results, update test cases, correlate defects
arguments:
  - name: createDefects
    description: Auto-create defects in Jira/GitHub for failures
    required: false
    default: false
  - name: updateExcel
    description: Update original Excel with pass/fail results
    required: false
    default: true
  - name: correlateDefects
    description: Correlate failures to requirements and defects
    required: false
    default: true
  - name: generateTrends
    description: Generate trend analysis and history
    required: false
    default: true
---

# SDET Analyze Results Skill

## Context
You are an SDET result analyst. Close the loop: results → test cases → defects → traceability.

## Instructions
1. **Load context**: `node .claude/scripts/state-helpers.js load`
2. **Load test results** from shared context (`sdet.execution.results.path`)
3. **Load original test cases** from `sdet.testcases.path` or `sdet.validation.annotated.path`
4. **Validate context**: `node .claude/scripts/context-helpers.js validate analyze-results`
5. **Match results to test cases** by:
   - Test Case ID (from test naming convention)
   - Automation ID (explicit link in test case)
   - Requirement ID + test name fuzzy match
6. **For each test case**, update:
   - **Status**: Passed, Failed, Skipped, Flaky, Error
   - **Actual Result**: Observed outcome
   - **Duration**: Execution time (ms)
   - **Error Details**: Stack trace, error message, screenshot link
   - **Retry Count**: Number of retries attempted
   - **Execution Timestamp**: ISO timestamp
   - **Environment**: Target environment
7. **If `{{updateExcel}}`**: 
   - Open original Excel (preserve formatting, formulas, styles)
   - Update/add result columns
   - Highlight: Green (pass), Red (fail), Yellow (flaky/skip), Gray (not run)
   - Save to `artifacts/test-cases/test-cases-results-{{timestamp}}.xlsx`
8. **Correlate failures** (if `{{correlateDefects}}`):
   - Group failures by requirement
   - Identify failure patterns (common root cause)
   - Map to existing defects (Jira, GitHub, GitLab, Azure)
   - Detect duplicate failures
   - Calculate impact: Requirements affected, test cases blocked
9. **If `{{createDefects}}` and Jira/GitHub configured**:
   - Create defects for critical/high failures
   - Include: Steps to reproduce, logs, screenshots, environment
   - Link defects to test cases and requirements
   - Set severity/priority based on test priority
10. **Generate traceability matrix**:
    ```
    Requirement → Test Cases → Automation → Results → Defects
    REQ-001     → TC-001,TC-002 → ui/playwright/tests/login.spec.ts → PASS → -
    REQ-002     → TC-003        → api/pactum/tests/users.spec.ts    → FAIL → DEF-123
    ```
11. **Save traceability matrix** to `artifacts/traceability/traceability-matrix-{{timestamp}}.xlsx`
12. **If `{{generateTrends}}`**:
    - Load historical trends from `artifacts/trends/history.json`
    - Append current run metrics
    - Calculate: Pass rate trend, flakiness trend, duration trend, defect escape rate
    - Detect regressions (statistical significance)
    - Save updated trends to `artifacts/trends/history.json`
13. **Generate analysis report**:
    ```json
    {
      "runId": "run-123",
      "timestamp": "2024-01-15T10:30:00Z",
      "summary": { "total": 500, "passed": 480, "failed": 15, "flaky": 3 },
      "byRequirement": { "REQ-001": "100%", "REQ-002": "60%" },
      "failures": [
        { "testCaseId": "TC-003", "requirementId": "REQ-002", "error": "Timeout", "defect": "DEF-123" }
      ],
      "flakyTests": [...],
      "defectsCreated": [...],
      "trends": { "passRate": "96%", "trend": "improving" }
    }
    ```
14. **Save analysis report** to `artifacts/analysis/analysis-report-{{timestamp}}.json`
15. **Update shared context**:
    ```javascript
    await saveContext('analyze-results', {
      updatedExcelPath: updatedExcelPath,
      defects: createdDefects,
      traceabilityPath: traceabilityPath,
      trendsPath: trendsPath,
      analysisReportPath: analysisReportPath,
      summary: analysisSummary
    });
    ```

## Shared Context Keys
- `sdet.results.updatedExcel.path`
- `sdet.results.defects[]`
- `sdet.results.traceability.path`
- `sdet.results.trends.path`
- `sdet.results.analysisReport.path`

## Arguments Reference
- **createDefects** (optional): Auto-create defects in Jira/GitHub for failures. Default: false
- **updateExcel** (optional): Update original Excel with pass/fail. Default: true
- **correlateDefects** (optional): Correlate failures to requirements and defects. Default: true
- **generateTrends** (optional): Generate trend analysis and history. Default: true

## Output
- `artifacts/test-cases/test-cases-results-<timestamp>.xlsx` (updated with results)
- `artifacts/traceability/traceability-matrix-<timestamp>.xlsx`
- `artifacts/trends/history.json` (updated)
- `artifacts/analysis/analysis-report-<timestamp>.json`
- Created defects in Jira/GitHub (if enabled)
- Updated shared context with analysis metadata

## Example Usage
```bash
/sdet-analyze-results --updateExcel true --createDefects true
/sdet-analyze-results --correlateDefects true --generateTrends true
/sdet-analyze-results --createDefects false --updateExcel true
```

## Implementation Notes
- Use `node .claude/scripts/state-helpers.js load` to load context
- Use `node .claude/scripts/state-helpers.js save sdet-analyze-results {...}` to save
- Preserve Excel formatting, formulas, conditional formatting, data validation
- Use SheetJS with style preservation for Excel updates
- Implement fuzzy matching for test case ↔ result correlation
- Support custom defect templates per project
- Generate executive summary for stakeholders