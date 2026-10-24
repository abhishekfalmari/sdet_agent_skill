---
name: sdet-backport
description: Backport tests to maintenance branches
arguments:
  - name: branches
    description: Target branches (comma-separated)
    required: true
  - name: strategy
    description: Strategy (cherry-pick, rewrite, adapter, conditional)
    required: false
    default: cherry-pick
  - name: fromBranch
    description: "Source branch (default: main)"
    required: false
    default: main
  - name: testPath
    description: Path to tests to backport
    required: false
---

# SDET Backport Skill

## Context
You are a Maintenance Engineer. Keep test coverage on supported versions.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load new tests, target {{branches}}, diff from {{fromBranch}} from context or {{testPath}}
2. For each target branch:
   - Analyze API/UI differences (breaking changes via git diff, OpenAPI diff, UI snapshot diff)
   - Identify test dependencies: selectors, APIs, data models, config, helpers
   - Apply {{strategy}}:
     - **cherry-pick**: Git cherry-pick with conflict resolution
       - Auto-resolve trivial conflicts (whitespace, formatting)
       - Flag complex conflicts for manual review
       - Run tests after each pick to verify
     - **rewrite**: Adapt to old APIs/selectors
       - Map new selectors → old selectors (selector archaeology)
       - Map new API endpoints → old endpoints (version mapping)
       - Map new data models → old models (field mapping)
       - Update imports, helpers, page objects
     - **adapter**: Compatibility layer
       - Create adapter module that translates new test calls to old implementation
       - Maintain single test source, adapter per branch
       - Example: `await clickButton()` → adapter calls old `await click('#btn')`
     - **conditional**: Skip/modify via version flags
       - Add `@since` / `@until` tags to test cases
       - Runtime version detection to enable/disable tests
       - Configuration-driven test filtering
3. Validate: Run backported tests on target branch
   - Full test suite execution
   - Compare results with source branch (pass rate, coverage)
   - Flag: New failures, flaky tests, missing dependencies
4. Create backport PRs per branch:
   - Title: `[backport] <original PR title> → <branch>`
   - Description: Strategy used, conflicts resolved, validation results
   - Labels: backport, target-branch, test-migration
   - Reviewers: Branch maintainers
5. Output:
   - Backport PRs per branch (URLs, status)
   - Validation results (pass/fail, coverage delta)
   - Failed backports with reasons and suggested fixes
   - Selector/API mapping documentation
6. Update shared context

## Shared Context Keys
- `sdet.backport.prs[]` (branch, prUrl, status, strategy, conflicts[])
- `sdet.backport.validated[]` (branch, passed, failed, coverageDelta)
- `sdet.backport.failed[]` (branch, test, reason, suggestedFix)
- `sdet.backport.mappings[]` (newSelector, oldSelector, newApi, oldApi)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| branches | string | true | | Target branches (comma-separated) |
| strategy | string | false | cherry-pick | Strategy (cherry-pick, rewrite, adapter, conditional) |
| fromBranch | string | false | main | Source branch |
| testPath | string | false | | Path to tests to backport |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-backport '{"prs":[],"validated":[],"failed":[],"mappings":[]}'
```

## Output
- Backport PRs per branch
- Validation results
- Failed backports analysis
- Selector/API mapping documentation