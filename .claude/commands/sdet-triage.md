---
name: sdet-triage
description: Automated defect triage and routing
arguments:
  - name: model
    description: Triage model (rule-based, ml, hybrid)
    required: false
    default: hybrid
  - name: autoAssign
    description: Auto-assign to team/owner
    required: false
    default: true
  - name: sla
    description: SLA config file path
    required: false
---

# SDET Triage Skill

## Context
You are a Triage Bot. Route defects instantly and accurately.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load new/untriaged defects from context:
   - `sdet.defect.created[]` (newly created defects)
   - `sdet.defect.report.path` (defect backlog)
   - Code ownership (CODEOWNERS, git history, team mappings)
2. Analyze each defect:
   - **Stack trace** → owning component/team (code ownership mapping)
   - **Error type** → category (bug, enhancement, config, env, data, test, documentation)
   - **Severity**: Business impact × user count × workaround availability
     - Critical: Data loss, security, complete outage, compliance violation
     - High: Major feature broken, no workaround, many users affected
     - Medium: Feature partially broken, workaround exists
     - Low: Minor issue, cosmetic, edge case
     - Info: Enhancement, documentation, tech debt
   - **Priority**: Severity × urgency × effort (RICE/WSJF scoring)
   - **Duplicate**: Similarity to existing defects (semantic + stack trace)
     - Exact match (same error, same location)
     - Related (same component, similar error)
     - Historical (fixed in past, regressed)
3. Apply {{model}}:
   - **Rule-based**: Component mapping, keyword rules, label rules
   - **ML**: Trained on historical triage decisions (classification + assignment)
   - **Hybrid**: Rules for clear cases, ML confidence for ambiguous
4. If {{autoAssign}}:
   - Assign to team/owner based on component ownership
   - Set labels: component, severity, priority, type
   - Add to sprint/backlog based on priority
   - Notify assignee (Slack, Teams, Email)
5. Apply {{sla}} if provided:
   - Response time by severity
   - Resolution time by severity
   - Escalation rules
6. Output:
   - Triage decisions log (defectId, decision, confidence, assignedTo)
   - Assignment changes (bulk API calls)
   - Duplicate clusters (primary defect, duplicates)
   - SLA tracking setup
7. Update shared context

## Shared Context Keys
- `sdet.triage.decisions[]` (defectId, category, severity, priority, confidence, assignedTo)
- `sdet.triage.assignments[]` (defectId, team, owner, sprint)
- `sdet.triage.duplicates[]` (primaryId, duplicateIds, similarity)
- `sdet.triage.sla[]` (defectId, responseDeadline, resolutionDeadline)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| model | string | false | hybrid | Triage model (rule-based, ml, hybrid) |
| autoAssign | boolean | false | true | Auto-assign to team/owner |
| sla | string | false | | SLA config file path |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-triage '{"decisions":[],"assignments":[],"duplicates":[],"sla":[]}'
```

## Output
- Triage decisions log
- Assignment changes
- Duplicate clusters
- SLA tracking