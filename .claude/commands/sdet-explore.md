---
name: sdet-explore
description: Manage exploratory testing sessions with charter-based approach
arguments:
  - name: charter
    description: Session charter (area, goal, timebox)
    required: true
  - name: technique
    description: Technique (tour, mind-map, sbet, freestyle)
    required: false
    default: sbet
  - name: timebox
    description: Session duration (minutes)
    required: false
    default: 90
  - name: tester
    description: Tester ID or 'auto'
    required: false
    default: auto
---

# SDET Explore Skill

## Context
You are an Exploratory Tester. Structure ad-hoc testing for maximum discovery.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Parse {{charter}}: Target area, testing goal, timebox ({{timebox}} min, typically 60-120)
2. Apply {{technique}}:
   - **Tour**: Feature tour, data tour, configuration tour, error tour, user tour, claims tour
   - **Mind-map**: Visual test idea generation (XMind, Miro, Mural, Mermaid)
   - **SBET**: Session-Based Test Management (charter, notes, debrief, metrics)
   - **Freestyle**: Unstructured with periodic note-taking
3. During session (automated capture):
   - Notes: Markdown with timestamps, screenshots, video clips
   - Bugs: One-click logging with context (URL, steps, data, env, severity)
   - Coverage: Areas visited (requirements, components, user flows, risks)
   - Metrics: Time on charter vs setup vs bugs vs reporting
   - Interruptions: Context switches, blockers, questions
4. Debrief (PROOF):
   - **Past**: What was tested (charter coverage %)
   - **Results**: Bugs found (severity, type), issues, questions
   - **Obstacles**: Blockers, environment issues, data issues, knowledge gaps
   - **Outlook**: Next charters, areas needing more testing, automation candidates
   - **Feelings**: Confidence, frustration, satisfaction, learning
5. Output:
   - Session report (Markdown + JSON)
   - Bugs with rich context (auto-linked to requirements)
   - Coverage map (heatmap of tested areas)
   - Next charter recommendations
   - Metrics: Defects/hour, charter coverage, setup time%
6. Update shared context

## Shared Context Keys
- `sdet.explore.sessions[]` (charter, technique, duration, tester, notes, bugs, coverage)
- `sdet.explore.bugs[]` (bug, charter, severity, context, status)
- `sdet.explore.coverage` (areas tested %, risks explored)
- `sdet.explore.nextCharters[]` (recommended follow-up charters)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| charter | string | true | | Session charter (area, goal, timebox) |
| technique | string | false | sbet | Technique (tour, mind-map, sbet, freestyle) |
| timebox | number | false | 90 | Session duration (minutes) |
| tester | string | false | auto | Tester ID |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-explore '{"sessions":[],"bugs":[],"coverage":0,"nextCharters":[]}'
```

## Output
- Session reports (Markdown + JSON)
- Bug reports with context
- Coverage heatmap
- Next charter recommendations