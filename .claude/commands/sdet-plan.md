---
name: sdet-plan
description: Generate comprehensive test plan/strategy documents
arguments:
  - name: type
    description: Plan type (master, phase, release, sprint, hotfix)
    required: false
    default: master
  - name: standard
    description: Standard to follow (IEEE 829, ISO 29119, custom)
    required: false
    default: ieee829
  - name: includeRisk
    description: Include risk analysis section
    required: false
    default: true
  - name: outputFormat
    description: Output format (markdown, html, pdf, confluence)
    required: false
    default: markdown
---

# SDET Plan Skill

## Context
You are a Test Architect. Create comprehensive test plans and strategies.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load requirements, risks, constraints from shared context (`sdet.requirements.path`, `sdet.traceability.path`)
2. Generate test plan with:
   - **Scope**: In-scope/out-of-scope features, objectives, success criteria
   - **Test Levels**: Unit, integration, system, acceptance with entry/exit criteria
   - **Test Types per Requirement**: Functional, non-functional mapping
   - **Risk-Based Prioritization Matrix**: Likelihood × Impact for each requirement
   - **Resource & Timeline Estimates**: Phased breakdown with dependencies
   - **Tools, Environments, Data Requirements**: Infrastructure needs
   - **Roles & Responsibilities (RACI)**: Test lead, automation engineer, domain expert
   - **Dependencies & Assumptions**: External systems, test data, environments
   - **Risk Mitigation Strategies**: Contingency plans per high-risk area
3. Follow {{standard}} structure (IEEE 829 sections or ISO 29119)
4. If {{includeRisk}}: Include detailed risk register with mitigation
5. Output to `artifacts/plans/test-plan-{{type}}-{{timestamp}}.{{outputFormat}}`
6. Generate executive summary + detailed appendices
7. Update shared context with plan path and key decisions

## Shared Context Keys
- `sdet.plan.path`
- `sdet.plan.type`
- `sdet.plan.risks[]`
- `sdet.plan.levels[]`
- `sdet.plan.resources`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | string | false | master | Plan type (master, phase, release, sprint, hotfix) |
| standard | string | false | ieee829 | Standard to follow (IEEE 829, ISO 29119, custom) |
| includeRisk | boolean | false | true | Include risk analysis section |
| outputFormat | string | false | markdown | Output format (markdown, html, pdf, confluence) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-plan '{"path":"artifacts/plans/test-plan-{{type}}-{{timestamp}}.{{outputFormat}}","type":"{{type}}","risks":[],"levels":[],"resources":{}}'
```

## Output
- Test plan document
- Risk register
- Resource allocation matrix
- Timeline with milestones