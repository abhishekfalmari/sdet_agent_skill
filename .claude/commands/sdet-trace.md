---
name: sdet-trace
description: Generate and maintain full bidirectional traceability
arguments:
  - name: format
    description: Output format (matrix, graph, json, excel, confluence, jira)
    required: false
    default: matrix
  - name: direction
    description: Trace direction (forward, backward, both, impact)
    required: false
    default: both
  - name: includeOrphans
    description: Include orphaned items (no links)
    required: false
    default: true
---

# SDET Trace Skill

## Context
You are a Traceability Engineer. Maintain complete requirement→test→code→defect links.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load all artifacts from context:
   - Requirements: `sdet.requirements.path`
   - Test cases: `sdet.testcases.path`
   - Automation: `sdet.automation.files[]`
   - Execution results: `sdet.execution.results.path`
   - Defects: `sdet.results.defects[]` or `sdet.defect.created[]`
   - Code changes: Git history, PR links
2. Build traceability graph:
   - **Requirement ↔ Test Case** (1:many) - from Excel traceability columns
   - **Test Case ↔ Automation Code** (1:1) - automationId links
   - **Automation Code ↔ Execution Result** (1:many) - test run IDs
   - **Result ↔ Defect** (many:1) - failure correlation
   - **Defect ↔ Code Fix** (1:many) - PR/commit links
   - **Code Fix ↔ Requirement** (impact analysis) - changed files → affected reqs
3. Analyze {{direction}}:
   - **Forward**: Requirement → Test Case → Automation → Result → Defect
   - **Backward**: Defect → Result → Automation → Test Case → Requirement
   - **Impact**: Code change → Affected requirements/tests (for regression selection)
4. Output {{format}}:
   - **Matrix**: Excel with hyperlinks to source artifacts
   - **Graph**: Mermaid/GraphViz for visualization (interactive HTML)
   - **JSON**: Machine-readable for tooling integration
   - **Confluence/Jira**: Wiki markup or API update for living documentation
5. Validate completeness:
   - No orphan requirements (without test cases)
   - No orphan test cases (without requirements)
   - No orphan automation (without test cases)
   - No orphan results (without automation)
   - Circular reference detection
6. If {{includeOrphans}}: List all orphans with remediation suggestions
7. Update shared context

## Shared Context Keys
- `sdet.trace.matrix.path` (Excel matrix)
- `sdet.trace.graph.path` (Mermaid/GraphViz)
- `sdet.trace.json.path` (machine-readable)
- `sdet.trace.orphans[]` (items without links)
- `sdet.trace.impact[]` (code change → affected tests)
- `sdet.trace.completeness` (% fully traced)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| format | string | false | matrix | Output format (matrix, graph, json, excel, confluence, jira) |
| direction | string | false | both | Trace direction (forward, backward, both, impact) |
| includeOrphans | boolean | false | true | Include orphaned items (no links) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-trace '{"matrixPath":"","graphPath":"","jsonPath":"","orphans":[],"impact":[],"completeness":0}'
```

## Output
- Traceability matrix (Excel with navigation)
- Interactive graph visualization (HTML)
- Orphan report with fix suggestions
- Impact analysis for regression testing
- Confluence/Jira sync capability