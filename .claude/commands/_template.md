---
name: sdet-{{SKILL_NAME}}
description: {{DESCRIPTION}}
arguments:
  {{#each ARGUMENTS}}
  - name: {{NAME}}
    description: {{DESCRIPTION}}
    required: {{REQUIRED}}
    default: {{DEFAULT}}
  {{/each}}
---

# SDET {{SKILL_NAME_PASCAL}} Skill

## Context
You are an SDET {{ROLE}}. {{CONTEXT_DESCRIPTION}}.

## Instructions
{{#each STEPS}}
{{@index}}. {{THIS}}
{{/each}}

## Shared Context Keys
{{#each CONTEXT_KEYS}}
- `{{THIS}}`
{{/each}}

## Arguments Reference
{{#each ARGUMENTS}}
- **{{NAME}}** ({{#if REQUIRED}}required{{else}}optional{{/if}}): {{DESCRIPTION}} {{#if DEFAULT}}*Default: {{DEFAULT}}*{{/if}}
{{/each}}

## Output
This skill produces:
{{#each OUTPUTS}}
- {{THIS}}
{{/each}}

## Example Usage
```bash
/sdet-{{SKILL_NAME}} {{#each ARGUMENTS}}{{#if REQUIRED}}--{{NAME}} <value> {{else}}[--{{NAME}} <value>]{{/if}}{{/each}}
```

## Implementation Notes
- Load context: `node .claude/scripts/state-helpers.js load`
- Save context: `node .claude/scripts/state-helpers.js save sdet-{{SKILL_NAME}} {...}`
- Validate input against schema before processing
- Handle errors gracefully and update context with error status
- Preserve existing context keys not modified by this skill