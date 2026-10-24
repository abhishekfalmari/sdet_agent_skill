---
name: sdet-data
description: Generate, manage, and version test data
arguments:
  - name: strategy
    description: Data strategy (synthetic, subset, clone, mask, fixture, hybrid)
    required: false
    default: hybrid
  - name: volume
    description: Data volume (small, medium, large, production-scale)
    required: false
    default: medium
  - name: entities
    description: Comma-separated entities to generate (or 'all')
    required: false
    default: all
  - name: format
    description: Output format (csv, json, sql, parquet, excel)
    required: false
    default: csv
---

# SDET Data Skill

## Context
You are a Test Data Engineer. Provide right data at right time with referential integrity.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Analyze test cases for data requirements (entities, relationships, volumes):
   - Load `sdet.testcases.path` for data needs per test
   - Load `sdet.requirements.path` for domain entities
   - Load `sdet.automation.files[]` for data-driven test patterns
2. Apply {{strategy}}:
   - **Synthetic**: Generate realistic fake data (Faker.js, custom generators per type)
   - **Subset**: Extract representative production subset (referential integrity via FK)
   - **Clone**: Full production clone (anonymized via sdet-mask)
   - **Mask**: Apply masking rules to sensitive fields
   - **Fixture**: Static curated datasets for regression
   - **Hybrid**: Combine strategies per entity (e.g., synthetic users, subset orders)
3. For {{volume}}: Scale data appropriately
   - small: 100s records
   - medium: 10K records
   - large: 1M records
   - production-scale: Full volume with partitioning
4. Manage lifecycle:
   - Version control (Git LFS or DVC for large files)
   - Schema evolution handling (migration scripts)
   - Refresh schedules (cron/CI triggers)
   - Cleanup policies (TTL, archive)
5. Output:
   - Data files ({{format}}) per entity in `artifacts/test-data/{{entity}}/`
   - Data contracts/schemas (JSON Schema, Avro)
   - Loading scripts per DB type (PostgreSQL, MySQL, SQL Server, MongoDB, etc.)
   - Data dictionary with field descriptions, constraints, examples
6. Update shared context

## Shared Context Keys
- `sdet.data.paths[]` (per entity file paths)
- `sdet.data.schemas[]` (JSON Schema per entity)
- `sdet.data.version` (semantic version)
- `sdet.data.strategy` (strategy used)
- `sdet.data.loadingScripts[]` (per DB type)
- `sdet.data.dictionary.path`

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| strategy | string | false | hybrid | Data strategy (synthetic, subset, clone, mask, fixture, hybrid) |
| volume | string | false | medium | Data volume (small, medium, large, production-scale) |
| entities | string | false | all | Comma-separated entities to generate |
| format | string | false | csv | Output format (csv, json, sql, parquet, excel) |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-data '{"paths":[],"schemas":[],"version":"1.0.0","strategy":"{{strategy}}","loadingScripts":[],"dictionaryPath":""}'
```

## Output
- Test data files per entity
- Data contracts/schemas
- Database loading scripts
- Data dictionary
- Version manifest