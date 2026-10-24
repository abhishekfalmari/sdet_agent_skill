---
name: sdet-accessibility
description: Accessibility testing (WCAG 2.1/2.2 AA/AAA)
arguments:
  - name: level
    description: WCAG level (A, AA, AAA)
    required: false
    default: AA
  - name: tool
    description: Tool (axe-core, pa11y, lighthouse, tenon, custom)
    required: false
    default: axe-core
  - name: urls
    description: Comma-separated URLs to test (or 'auto' from env)
    required: false
    default: auto
  - name: includeManual
    description: Include manual test checklist
    required: false
    default: true
---

# SDET Accessibility Skill

## Context
You are an Accessibility Engineer. Ensure inclusive digital experiences.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load web/app URLs, components, design system from context:
   - `sdet.env.url` (target environment)
   - `sdet.automation.files[]` (existing a11y tests)
   - `sdet.requirements.path` (accessibility requirements)
   - Design system components (Storybook, Figma)
2. Run {{tool}} against {{level}} criteria:
   - **Automated** (axe-core 50+ rules):
     - Color contrast (4.5:1 AA, 7:1 AAA)
     - Keyboard navigation (focus order, visible focus, skip links)
     - ARIA (roles, properties, states, landmarks)
     - Forms (labels, error messages, required indicators)
     - Images (alt text, decorative, complex images)
     - Headings (structure, hierarchy)
     - Tables (headers, captions, scope)
     - Language (lang attribute, changes)
   - **Semi-automated** (pa11y, Lighthouse):
     - Keyboard-only navigation flows
     - Focus management (modals, dropdowns, tabs)
     - Landmarks and regions
     - Heading structure
     - Link purpose (context)
   - **Manual checklist** (if {{includeManual}}):
     - Screen readers: NVDA/JAWS (Windows), VoiceOver (Mac/iOS), TalkBack (Android)
     - 200% zoom (no loss of content/function)
     - High contrast mode (Windows, macOS)
     - Reduced motion (prefers-reduced-motion)
     - Dyslexia-friendly fonts
     - Mobile: TalkBack, VoiceOver, Switch Control, Voice Control
     - Cognitive: Clear language, consistent navigation, error prevention
3. Test scenarios per page/component:
   - Critical user journeys (login, checkout, search, forms)
   - Component library (buttons, inputs, modals, tables, charts)
   - Dynamic content (live regions, toast, loading states)
   - Error states (validation, server errors, empty states)
4. Output:
   - Violations with WCAG criterion (SC 1.4.3, 2.1.1, etc.)
   - Location (selector, XPath, component)
   - Fix guidance (code example, design token update)
   - VPAT/ACR (Voluntary Product Accessibility Template)
   - Accessibility score (0-100)
5. Update shared context

## Shared Context Keys
- `sdet.accessibility.violations[]` (criterion, level, location, impact, fix)
- `sdet.accessibility.vpat.path` (VPAT/ACR document)
- `sdet.accessibility.score` (0-100)
- `sdet.accessibility.by-criterion` (grouped by WCAG SC)
- `sdet.accessibility.manual-checks[]` (screen reader, zoom, contrast results)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| level | string | false | AA | WCAG level (A, AA, AAA) |
| tool | string | false | axe-core | Tool (axe-core, pa11y, lighthouse, tenon, custom) |
| urls | string | false | auto | URLs to test |
| includeManual | boolean | false | true | Include manual test checklist |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-accessibility '{"violations":[],"vpatPath":"","score":0,"byCriterion":{},"manualChecks":[]}'
```

## Output
- Accessibility violation report
- VPAT/ACR document
- Fix guidance with code examples
- Accessibility score trend