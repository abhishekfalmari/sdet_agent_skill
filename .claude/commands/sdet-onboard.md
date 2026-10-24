---
name: sdet-onboard
description: Generate onboarding guides and knowledge base from tests
arguments:
  - name: role
    description: Target role (sdet, qa, dev, pm, new-hire, contractor)
    required: false
    default: new-hire
  - name: depth
    description: Depth (overview, deep-dive, hands-on, reference, all)
    required: false
    default: hands-on
  - name: format
    description: Output format (notebook, portal, video-script, quiz, all)
    required: false
    default: portal
---

# SDET Onboard Skill

## Context
You are an Onboarding Engineer. Accelerate team ramp-up.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load project context:
   - Architecture: `sdet.service-map.graph`, service docs
   - Test suite: `sdet.testcases.path`, `sdet.automation.files[]`, `sdet.automation.framework`
   - Tools: CI/CD (`sdet.pipeline.platform`), test tools, monitoring
   - Processes: `sdet.governance.violations[]`, `sdet.retro.actions[]`, release flow
   - Quality: `sdet.coverage.code`, `sdet.flake.flaky[]`, `sdet.insights.kpis`
2. For {{role}} at {{depth}}:
   - **Overview** (Day 1): System map, test pyramid, key flows, team structure, communication channels
   - **Deep-dive** (Week 1): Test patterns, frameworks, debugging, selectors, data management, CI/CD
   - **Hands-on** (Week 1-2): Guided exercises:
     - Run full test suite locally
     - Add a test case (Excel → automation → execute)
     - Fix a flaky test
     - Run performance test
     - Create defect from failure
     - Deploy to staging
   - **Reference**: Cheat sheets (commands, selectors, patterns), FAQ, troubleshooting, glossary
3. Generate {{format}}:
   - **Notebook**: Jupyter/Observable with executable code cells
   - **Portal**: Static site (VitePress/Docusaurus) with progress tracking
   - **Video-script**: Scene-by-scene scripts for recording
   - **Quiz**: Assessment questions (multiple choice, practical) with auto-grading
4. Features:
   - Progress tracking (checklist, badges, certification)
   - Buddy pairing suggestions (skill match, timezone, experience)
   - Mentor dashboard (mentee progress, stuck alerts)
   - Searchable knowledge base (Algolia, local search)
   - Feedback collection (NPS, qualitative)
5. Output:
   - Onboarding portal URL
   - Module completion criteria
   - Assessment results
   - Buddy/mentor assignments
6. Update shared context

## Shared Context Keys
- `sdet.onboard.portal.url`
- `sdet.onboard.modules[]` (id, title, depth, exercises[], completionCriteria)
- `sdet.onboard.assessment` (questions[], passingScore, results[])
- `sdet.onboard.buddies[]` (mentee, mentor, skills[], timezone)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| role | string | false | new-hire | Target role |
| depth | string | false | hands-on | Content depth |
| format | string | false | portal | Output format |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-onboard '{"portalUrl":"","modules":[],"assessment":{},"buddies":[]}'
```

## Output
- Onboarding portal / notebook
- Guided exercises with solutions
- Assessment & certification
- Buddy pairing recommendations