---
name: sdet-usability
description: Plan, recruit, conduct, and analyze usability tests
arguments:
  - name: method
    description: Method (moderated, unmoderated, remote, in-person, guerrilla, five-second)
    required: false
    default: remote-unmoderated
  - name: participants
    description: Number of participants
    required: false
    default: 5
  - name: tasks
    description: Task file path or 'auto' from requirements
    required: false
    default: auto
  - name: platform
    description: Platform (usertesting, maze, lookback, usertesting, custom)
    required: false
    default: usertesting
---

# SDET Usability Skill

## Context
You are a UX Researcher. Validate usability with real users.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Define research objectives, tasks, success criteria from context:
   - `sdet.requirements.path` (user stories, acceptance criteria)
   - `sdet.testcases.path` (usability-marked test cases)
   - `sdet.env.url` (prototype/production URL)
   - Personas, user journeys, JTBD (Jobs To Be Done)
2. Recruit {{participants}} matching personas:
   - Screening survey (demographics, behavior, experience)
   - Incentive calculation (time, complexity, platform)
   - Scheduling (Calendly, platform scheduler)
   - Consent forms (recording, NDA, GDPR)
3. Configure {{method}} on {{platform}}:
   - **Moderated**: Live sessions, think-aloud, probing questions, follow-up
   - **Unmoderated**: Recorded tasks, automated metrics, self-guided
   - **Remote**: Screen share, webcam, audio (UserTesting, Maze, Lookback, UserZoom)
   - **In-person**: Lab, eye-tracking, physiological, observation room
   - **Guerrilla**: Coffee shop, hallway, 5-10 min, low fidelity
   - **Five-second**: First impression, recall, trust, clarity
4. Define tasks (from {{tasks}} or auto-generate):
   - Task scenarios (realistic, goal-oriented, no UI hints)
   - Success criteria (completion, time, errors, path deviation)
   - Pre/post questionnaires (SUS, NPS, SEQ, UMUX, custom)
5. Metrics collection:
   - **Quantitative**: Task success (%), time on task, error count, clicks, SUS, NPS, SEQ
   - **Qualitative**: Think-aloud transcripts, observations, ratings, comments
   - **Behavioral**: Heatmaps, clickstreams, scroll depth, rage clicks
7. Analyze:
   - Affinity mapping (themes across participants)
   - Severity rating (critical, major, minor, cosmetic)
   - Root cause (design, content, flow, technical, mental model)
   - Prioritization (impact × frequency × effort)
8. Output:
   - Usability report (executive summary + detailed findings)
   - Video highlights (clips per finding)
   - Design recommendations (wireframes, copy, flow changes)
   - Metrics dashboard (SUS trend, task success trend)
   - Action items (owner, priority, due date)
9. Update shared context

## Shared Context Keys
- `sdet.usability.metrics` (SUS, NPS, task success, time, errors)
- `sdet.usability.findings[]` (theme, severity, evidence, recommendation)
- `sdet.usability.recordings[]` (platform, participant, task, clips)
- `sdet.usability.actionItems[]` (finding, owner, priority, due)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| method | string | false | remote-unmoderated | Method (moderated, unmoderated, remote, in-person, guerrilla, five-second) |
| participants | number | false | 5 | Number of participants |
| tasks | string | false | auto | Task file path |
| platform | string | false | usertesting | Platform (usertesting, maze, lookback, usertesting, custom) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-usability '{"metrics":{},"findings":[],"recordings":[],"actionItems":[]}'
```

## Output
- Usability test report
- Video highlight reel
- Design recommendations
- Metrics dashboard
- Prioritized action items