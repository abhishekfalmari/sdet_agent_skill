---
name: sdet-seed
description: Seed databases and manage test state
arguments:
  - name: db
    description: Database type (postgres, mysql, sqlserver, oracle, mongodb, dynamodb, redis, all)
    required: false
    default: all
  - name: strategy
    description: Seeding strategy (truncate, transaction-rollback, snapshot, flyway, liquibase)
    required: false
    default: transaction-rollback
  - name: dataSource
    description: Data source (sdet-data, custom-file, auto)
    required: false
    default: sdet-data
  - name: parallel
    description: Parallel seeding (true/false)
    required: false
    default: true
---

# SDET Seed Skill

## Context
You are a Database Test Engineer. Ensure consistent database state for tests.

Load shared context:
```bash
node .sdet-skills/scripts/state-helpers.js load
```

## Instructions
1. Load schema, test data, reference data from context:
   - `sdet.data.paths[]` for test data files
   - `sdet.data.schemas[]` for schema definitions
   - `sdet.mask.path` for masked production data
   - Migration scripts from project
2. For each {{db}}:
   - Generate seed scripts (SQL, migrations, JS/TS scripts)
   - Handle {{strategy}}:
     - **truncate**: TRUNCATE CASCADE + INSERT (fast, no rollback, resets sequences)
     - **transaction-rollback**: BEGIN + seed + test + ROLLBACK (isolated, slower)
     - **snapshot**: Restore from snapshot (fastest for large DB, requires snapshot mgmt)
     - **flyway**: Migration-based versioned seeding (version control, repeatable)
     - **liquibase**: XML/YAML/JSON changesets with contexts/labels
3. Handle complexities:
   - Referential integrity (FK order: parents before children)
   - Sequence/identity reset (PostgreSQL sequences, MySQL AUTO_INCREMENT, SQL Server IDENTITY)
   - Large object handling (BLOB/CLOB, file storage)
   - Multi-tenant data isolation (schema per tenant, row-level security)
   - Temporal data (valid_from/valid_to, slowly changing dimensions)
   - Cross-DB consistency (distributed transactions, saga patterns)
4. For {{dataSource}}:
   - **sdet-data**: Use generated test data from sdet-data skill
   - **custom-file**: Load from specified CSV/JSON/SQL files
   - **auto**: Detect available data sources
5. If {{parallel}}: Seed independent schemas/tables in parallel
6. Output:
   - Seed scripts in `artifacts/seeds/{{db}}/`
   - Execution logs with timing
   - Verification queries (row counts, checksums, sample data)
   - Rollback/cleanup scripts
7. Update shared context

## Shared Context Keys
- `sdet.seed.scripts[]` (per DB: script path, strategy, tables)
- `sdet.seed.status` (success, partial, failed)
- `sdet.seed.verification[]` (per DB: query, expected, actual)
- `sdet.seed.duration` (total seeding time)
- `sdet.seed.rollbackScripts[]` (cleanup scripts)

## Arguments Reference
| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| db | string | false | all | Database type (postgres, mysql, sqlserver, oracle, mongodb, dynamodb, redis, all) |
| strategy | string | false | transaction-rollback | Seeding strategy (truncate, transaction-rollback, snapshot, flyway, liquibase) |
| dataSource | string | false | sdet-data | Data source (sdet-data, custom-file, auto) |
| parallel | boolean | false | true | Parallel seeding |

## Context Save
After execution, save context:
```bash
node .sdet-skills/scripts/state-helpers.js save sdet-seed '{"scripts":[],"status":"success","verification":[],"duration":0,"rollbackScripts":[]}'
```

## Output
- Database seed scripts per type
- Execution logs
- Verification reports
- Rollback scripts