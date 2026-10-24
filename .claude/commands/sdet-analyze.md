---
name: sdet-analyze
description: Parse requirements into structured format with traceability
arguments:
  - name: source
    description: Path to requirements folder, URL, or 'clipboard'
    required: false
  - name: format
    description: Output format (json, gherkin, markdown)
    required: false
    default: json
  - name: traceability
    description: Enable bidirectional traceability mapping
    required: false
    default: true
---

# SDET Analyze Skill

## Context
You are an SDET requirement analyst. Parse the input requirements into structured format with traceability IDs.

## Instructions
1. **Load context**: `node .sdet-skills/scripts/state-helpers.js load`
2. **Determine input source**:
   - If `{{source}}` provided: use that path/URL
   - Else: check `requirements/` folder in project root
   - Else: check shared context for `sdet.requirements.raw`
3. **Parse requirements** from supported formats:
   - **Markdown**: Extract headers, lists, tables, code blocks
   - **Jira**: Use Jira REST API (requires auth in config)
   - **Confluence**: Use Confluence REST API
   - **GitHub**: Parse issues, PR descriptions, wiki
   - **OpenAPI/Swagger**: Extract endpoints, schemas, examples
   - **PDF**: Extract text, tables, structure
   - **JSON/YAML**: Direct structured import
4. **Extract for each requirement**:
   - Unique ID (auto-generate REQ-XXX if missing)
   - Type: functional, non-functional, security, performance, accessibility, usability
   - Title (concise, descriptive)
   - Description (detailed explanation)
   - Acceptance criteria (list of testable conditions)
   - Priority: critical, high, medium, low
   - Tags (area, component, team, labels)
   - Dependencies (blocked by, blocks, relates to)
   - Metadata (source, author, created, modified)
5. **Build traceability graph** if `{{traceability}}`:
   - Requirement ↔ Requirement dependencies
   - Requirement → Future test case mapping placeholder
6. **Output structured JSON** to `artifacts/requirements/structured-requirements-{{timestamp}}.json`
7. **Save traceability map** to `artifacts/requirements/traceability-map-{{timestamp}}.json`
8. **Update shared context**:
   ```javascript
   await saveContext('analyze', {
     count: requirements.length,
     path: outputPath,
     traceabilityPath: traceabilityPath,
     summary: { byType, byPriority, byTag }
   });
   ```
9. **Notify** if enabled: `node .sdet-skills/scripts/notify-helpers.js notify skillComplete ...`

## Shared Context Keys
- `sdet.requirements.count`
- `sdet.requirements.path`
- `sdet.requirements.summary`
- `sdet.traceability.path`
- `sdet.traceability.graph`

## Arguments Reference
- **source** (optional): Path to requirements folder, URL (Jira/Confluence/GitHub), or 'clipboard'
- **format** (optional): Output format - json, gherkin, markdown. Default: json
- **traceability** (optional): Enable bidirectional traceability mapping. Default: true

## Output
- `artifacts/requirements/structured-requirements-<timestamp>.json`
- `artifacts/requirements/traceability-map-<timestamp>.json`
- Updated shared context with requirements data

## Example Usage
```bash
/sdet-analyze --source ./requirements --format json
/sdet-analyze --source https://jira.company.com/browse/PROJ-123 --format json
/sdet-analyze --source clipboard --format gherkin
```

## Implementation Notes
- Use `node .sdet-skills/scripts/state-helpers.js load` to load context
- Use `node .sdet-skills/scripts/state-helpers.js save sdet-analyze {...}` to save
- Validate input against JSON schema before processing
- Handle errors gracefully and update context with error status
- Support incremental parsing (only parse new/changed requirements)
- Preserve existing context keys not modified by this skill