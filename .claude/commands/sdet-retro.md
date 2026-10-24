---
name: sdet-retro
description: Data-driven sprint retrospective for quality
arguments:
  - name: sprint
    description: Sprint ID or 'current'
    required: false
    default: current
  - name: format
    description: Output format (report, slides, miro, mural, action-items, all)
    required: false
    default: report
  - name: lookback
    description: Number of sprints to analyze
    required: false
    default: 3
---

# SDET Retro Skill

## Context
You are a Quality Coach. Run data-driven retrospectives.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load sprint data for {{sprint}} and {{lookback}} previous sprints from context:
   - Test results: `sdet.execution.summary` per sprint
   - Defects: `sdet.defect.created[]`, `sdet.defect.closed[]` per sprint
   - Velocity: Story points committed vs completed
   - Cycle time: `sdet.execution.duration`, lead time for defects
   - Coverage: `sdet.coverage.code`, `sdet.coverage.requirement` trends
   - Flakiness: `sdet.flake.flaky[]`, quarantine rate
   - Process: Test-first %, automation %, review coverage (from governance)
2. Analyze quality trends:
   - **Pass rate trend**: Sparkline, regression detection, seasonality
   - **Defect escape rate**: Production defects / total defects
   - **Flakiness trend**: Quarantined tests, re-flake rate, MTTR
   - **Coverage trend**: Code, requirement, risk coverage delta
   - **Cycle time**: Test execution time, defect resolution time
   - **Automation ROI**: Automated vs manual test ratio, maintenance cost
3. Identify bottlenecks:
   - Slow tests (top 10 by duration)
   - Flaky tests (top 10 by failure rate)
   - Environment issues (provisioning time, instability)
   - Data issues (masking failures, seed failures)
   - Skill gaps (areas with low coverage, high defects)
4. Team health:
   - Workload distribution (tests per person)
   - Knowledge sharing (bus factor, cross-training)
   - Onboarding effectiveness (time to first commit)
   - Meeting load vs deep work time
5. Generate {{format}}:
   - **Report**: Structured findings + recommendations (Markdown/PDF)
   - **Slides**: Presentation-ready (Reveal.js, PowerPoint)
   - **Miro**: Interactive board (sticky notes, clustering, voting)
   - **Mural**: Template-based retro board
   - **Action-items**: SMART goals with owners, due dates, success criteria
6. Track: Action item completion across sprints (carryover, done, blocked)
7. Update shared context

## Shared Context Keys
- `sdet.retro.findings[]` (category, finding, evidence, severity, trend)
- `sdet.retro.actions[]` (id, description, owner, dueDate, status, sprint)
- `sdet.retro.metrics` (passRate, defectEscape, flakiness, coverage, cycleTime)
- `sdet.retro.bottlenecks[]` (type, item, impact, recommendation)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| sprint | string | false | current | Sprint ID or 'current' |
| format | string | false | report | Output format |
| lookback | number | false | 3 | Sprints to analyze |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-retro '{"findings":[],"actions":[],"metrics":{},"bottlenecks":[]}'
```

## Output
- Retrospective report/slides/board
- Action items with owners
- Trend visualizations
- Bottleneck analysis