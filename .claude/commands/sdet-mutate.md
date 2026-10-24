---
name: sdet-mutate
description: Mutation testing to measure test effectiveness
arguments:
  - name: tool
    description: Mutation tool (stryker, pitest, mutmut, infection, mull)
    required: false
    default: stryker
  - name: mutators
    description: Mutators to apply (defaults, all, specific list)
    required: false
    default: defaults
  - name: threshold
    description: Minimum mutation score (0-100)
    required: false
    default: 80
---

# SDET Mutate Skill

## Context
You are a Mutation Testing Engineer. Find tests that don't catch bugs.

Load shared context:
```bash
node .claude/scripts/state-helpers.js load
```

## Instructions
1. Load source code, test suite from context:
   - `sdet.automation.files[]` (automation code)
   - Source code from project (src/, lib/, app/)
   - Test files (tests/, spec/, __tests__/)
   - Build config (package.json, pom.xml, build.gradle, Cargo.toml)
2. Run {{tool}} with {{mutators}}:
   - **Stryker**: JavaScript/TypeScript, C#, Scala - 30+ mutators
   - **PITest**: Java, Maven/Gradle - 20+ mutators
   - **Mutmut**: Python, pytest - minimal config
   - **Infection**: PHP, PHPUnit - 15+ mutators
   - **Mull**: C/C++, LLVM-based - clang mutators
   - **Mutators**: Conditionals, arithmetic, literals, returns, void calls, boolean, string, regex
3. For each mutant:
   - Apply mutation to source
   - Run affected tests (incremental)
   - Result: **Killed** (test failed), **Survived** (all passed), **Timeout**, **No coverage**, **Error**
4. Calculate: Mutation score = killed / (killed + survived) × 100
5. Analyze survivors:
   - **Equivalent mutants**: Code change doesn't change behavior (false positive)
   - **Missing assertions**: Test doesn't verify mutated behavior
   - **Weak test data**: Data doesn't exercise mutated path
   - **Untested edge cases**: Boundary conditions not covered
   - **Trivial mutations**: Logging, debug, toString changes
6. Output:
   - Mutation report (HTML, JSON, Markdown)
   - Surviving mutants with source location
   - Test improvement suggestions (add assertion, change data, new test)
   - Per-file mutation score
   - Trend vs previous runs
7. Enforce {{threshold}} in CI (fail if score < threshold)
8. Update shared context

## Shared Context Keys
- `sdet.mutate.score` (overall mutation score %)
- `sdet.mutate.by-file[]` (file, score, killed, survived, timeout)
- `sdet.mutate.survivors[]` (mutant, location, original, mutated, suggestion)
- `sdet.mutate.improvements[]` (file, suggestion, priority, effort)
- `sdet.mutate.thresholdMet` (boolean)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| tool | string | false | stryker | Mutation tool (stryker, pitest, mutmut, infection, mull) |
| mutators | string | false | defaults | Mutators to apply |
| threshold | number | false | 80 | Minimum mutation score |

## Context Save
After execution, save context:
```bash
node .claude/scripts/state-helpers.js save sdet-mutate '{"score":0,"byFile":[],"survivors":[],"improvements":[],"thresholdMet":false}'
```

## Output
- Mutation testing report
- Surviving mutants with fix suggestions
- Test improvement backlog
- CI gate configuration