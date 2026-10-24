# Migration Guide

Guide for migrating between SDET Skills versions and from other testing frameworks.

## Table of Contents
1. [Version Migration](#version-migration)
2. [From Other Frameworks](#from-other-frameworks)
3. [Configuration Migration](#configuration-migration)
4. [Template Migration](#template-migration)
5. [CI/CD Pipeline Migration](#cicd-pipeline-migration)
6. [Data Migration](#data-migration)
7. [Breaking Changes](#breaking-changes)
8. [Rollback Procedure](#rollback-procedure)

---

## Version Migration

### v0.x → v1.0 (Initial Release)

No migration needed - fresh install.

### Future Versions (v1.x → v1.y)

When new versions are released:

```bash
# 1. Backup current installation
cp -r ~/.claude/skills/sdet ~/.claude/skills/sdet.backup

# 2. Update skill pack
cd ~/.claude/skills/sdet
git pull origin main

# 3. Run migration script (if provided)
node scripts/migrate.js --from 1.0 --to 1.1

# 4. Validate skills
node scripts/validate-skills.js
node scripts/lint-skills.js

# 5. Reinstall hooks
node scripts/install.js

# 6. Test with a project
cd /path/to/test/project
/sdet-orchestrate --workflow quick --autoApprove
```

### Automated Migration Script

```javascript
// scripts/migrate.js (run when upgrading)
const fs = require('fs').promises;
const path = require('path');

async function migrate(fromVersion, toVersion) {
  const migrations = {
    '1.0->1.1': async () => {
      // Example: Add new context keys
      const ctxPath = '.claude/context/sdet-context.json';
      if (await fs.access(ctxPath).then(() => true).catch(() => false)) {
        const ctx = JSON.parse(await fs.readFile(ctxPath, 'utf8'));
        ctx.schemaVersion = '1.1';
        ctx.migratedAt = new Date().toISOString();
        await fs.writeFile(ctxPath, JSON.stringify(ctx, null, 2));
      }
      
      // Update skill frontmatter if needed
      // ...
    }
  };

  const key = `${fromVersion}->${toVersion}`;
  if (migrations[key]) {
    await migrations[key]();
    console.log(`Migration ${key} completed`);
  } else {
    console.log(`No migration needed for ${key}`);
  }
}

// CLI
const [, , from, to] = process.argv;
migrate(from, to).catch(console.error);
```

---

## From Other Frameworks

### From Manual Testing (Excel/Word Only)

**Current State**: Test cases in Excel, manual execution, no automation.

**Migration Path**:
```bash
# 1. Import existing Excel test cases
/sdet-validate --file ./existing-test-cases.xlsx --import true

# 2. Generate automation for high-priority tests
/sdet-prioritize --algorithm risk --budget "20 tests"
/sdet-automate --type ui,api --framework playwright

# 3. Set up CI/CD
/sdet-deploy --platform github-actions --qualityGates true

# 4. Run hybrid (manual + automated)
/sdet-execute --type ui,api --parallel 4
# Manual tests tracked in Excel with "Status" column
```

**Excel Import Format**:
```excel
Required columns:
- Test Case ID (unique)
- Requirement ID(s) 
- Title
- Type (Functional, Security, Performance, etc.)
- Priority (Critical, High, Medium, Low)
- Preconditions
- Steps (numbered)
- Test Data
- Expected Result
- Automation Status (Manual, Planned, Automated)
- Tags
```

### From Selenium/Java/JUnit

**Current State**: Selenium WebDriver + JUnit/TestNG + Maven/Gradle.

**Migration Path**:
```bash
# 1. Analyze existing tests
/sdet-analyze --source ./src/test/java --format json --extractor selenium

# 2. Migrate to Playwright
/sdet-migrate --from selenium --to playwright --mode hybrid

# 3. Validate migration
/sdet-validate --file ./modern/playwright-tests/ --compare ./src/test/java

# 4. Run comparison
/sdet-execute --compareMode true \
  --legacyCmd "mvn test -Dtest=SeleniumTests" \
  --modernCmd "npx playwright test"

# 5. Generate report
/sdet-report --type migration --format html
```

**Key Differences**:
| Selenium/Java | Playwright/TypeScript |
|---------------|----------------------|
| WebDriver API | CDP-based, faster |
| Thread.sleep | Auto-waiting |
| PageFactory | Native POM |
| Maven/Gradle | npm/npx |
| JUnit/TestNG | Playwright Test |

### From Cypress

**Current State**: Cypress E2E tests.

**Migration Path**:
```bash
# 1. Analyze Cypress tests
/sdet-analyze --source ./cypress --format json --extractor cypress

# 2. Migrate
/sdet-migrate --from cypress --to playwright --mode hybrid

# 3. Handle Cypress-specific:
# - cy.intercept() → page.route()
# - cy.fixture() → test data files
# - cy.task() → Node.js helpers
# - Custom commands → Playwright fixtures
```

### From Postman Collections

**Current State**: Postman collections for API testing.

**Migration Path**:
```bash
# 1. Import collections
/sdet-analyze --source ./postman/collections --format json --extractor postman

# 2. Generate contract tests
/sdet-contract --framework pact --role both

# 3. Generate k6 load tests
/sdet-load --type load --tool k6 --from postman

# 4. Generate Pactum functional tests
/sdet-automate --type api --framework pactum
```

### From JMeter/Gatling

**Current State**: JMeter JMX or Gatling Scala scripts.

**Migration Path**:
```bash
# 1. Convert to k6
/sdet-migrate --from jmeter --to k6 --mode translate
# or
/sdet-migrate --from gatling --to k6 --mode translate

# 2. Or generate fresh from requirements
/sdet-load --type load --tool k6
```

### From Custom Frameworks

**Current State**: Home-grown test framework.

**Migration Path**:
```bash
# 1. Document current framework patterns
# 2. Create custom extractor
# 3. Add to analyze skill extractors
# 4. Create custom automation template
# 5. Migrate incrementally
```

---

## Configuration Migration

### sdet.config.yaml v1.0 → v1.1

**Changes**: New fields added, some renamed.

```yaml
# v1.0
project:
  id: "my-project"
  name: "My Project"

skills:
  analyze:
    enabled: true
    sources: ["./requirements"]

# v1.1 (additive - old config still works)
project:
  id: "my-project"
  name: "My Project"
  version: "1.0.0"  # NEW
  description: "Project description"  # NEW

skills:
  analyze:
    enabled: true
    config:  # NEW: nested config object
      sources: ["./requirements"]
      extractors: ["markdown", "openapi"]  # NEW
      llmModel: "claude-3-5-sonnet"  # NEW
```

**Auto-migration**:
```bash
node scripts/migrate-config.js --input sdet.config.yaml --output sdet.config.yaml.new
```

---

## Template Migration

### Excel Template Updates

When standard template changes:

```bash
# 1. Backup current template
cp templates/excel/standard.xlsx templates/excel/standard.xlsx.backup

# 2. Generate new template
node templates/excel/standard.xlsx.template.js

# 3. Migrate existing test cases
node scripts/migrate-excel.js \
  --input artifacts/test-cases/old.xlsx \
  --template templates/excel/standard.xlsx \
  --output artifacts/test-cases/migrated.xlsx
```

**Excel Migration Script**:
```javascript
// scripts/migrate-excel.js
const ExcelJS = require('exceljs');

async function migrateExcel(inputPath, templatePath, outputPath) {
  const source = new ExcelJS.Workbook();
  await source.xlsx.readFile(inputPath);
  
  const template = new ExcelJS.Workbook();
  await template.xlsx.readFile(templatePath);
  
  // Map old columns to new
  const columnMap = {
    'Test Case ID': 'testCaseId',
    'Requirement ID': 'requirementIds',
    'Test Title': 'title',
    'Test Type': 'type',
    'Test Priority': 'priority',
    'Pre-conditions': 'preconditions',
    'Test Steps': 'steps',
    'Test Data': 'testData',
    'Expected Result': 'expectedResult',
    'Automation Status': 'automationStatus',
    'Tags': 'tags'
  };
  
  const sourceSheet = source.worksheets[0];
  const templateSheet = template.worksheets[0];
  
  // Copy data with column mapping
  sourceSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // Skip header
    
    const newRow = templateSheet.addRow();
    Object.entries(columnMap).forEach(([oldCol, newCol]) => {
      const oldCell = row.getCell(oldCol);
      if (oldCell) {
        newRow.getCell(newCol).value = oldCell.value;
      }
    });
  });
  
  await template.xlsx.writeFile(outputPath);
  console.log(`Migrated ${sourceSheet.rowCount - 1} test cases`);
}
```

### Automation Template Updates

```bash
# Regenerate all framework templates
cd templates/automation
for dir in */; do
  if [ -f "${dir}template.js" ]; then
    echo "Generating ${dir}..."
    node "${dir}template.js"
  fi
done
```

---

## CI/CD Pipeline Migration

### From Jenkins to GitHub Actions

```bash
# 1. Generate GitHub Actions pipeline
/sdet-deploy --platform github-actions --qualityGates true

# 2. Map Jenkins concepts:
# Jenkins Stage → GitHub Actions Job
# Jenkins Agent → GitHub Actions Runner
# Jenkins Credentials → GitHub Secrets
# Jenkins Shared Library → Composite Actions

# 3. Migrate Jenkinsfile
# Jenkinsfile (declarative) → .github/workflows/sdet-pipeline.yml
```

### From GitLab CI to GitHub Actions

```bash
# 1. Generate GitHub Actions
/sdet-deploy --platform github-actions

# 2. Key differences:
# GitLab: stages, variables, rules, needs
# GitHub: jobs, env, if, needs
# GitLab: artifacts → GitHub: actions/upload-artifact
# GitLab: cache → GitHub: actions/cache
```

### From Azure DevOps to GitHub Actions

```bash
# 1. Generate both for comparison
/sdet-deploy --platform azure-devops --output azure-pipelines.yml
/sdet-deploy --platform github-actions --output github-actions.yml

# 2. Migrate:
# Azure: stages, jobs, steps, variables, pools
# GitHub: jobs, steps, env, runs-on
# Azure: templates → GitHub: reusable workflows
```

---

## Data Migration

### Test Case Data

```bash
# Export from old system
# Jira Xray: Export to Excel/CSV
# Zephyr: Export to Excel
# qTest: Export to Excel

# Import to SDET Skills
/sdet-validate --file ./exported-test-cases.xlsx --import true

# Or convert CSV
node scripts/csv-to-excel.js --input test-cases.csv --output test-cases.xlsx
```

### Defect Data

```bash
# Sync defects from Jira/GitHub
/sdet-defect --system jira --action sync --project PROJ
/sdet-defect --system github --action sync --repo owner/repo

# Link defects to test cases
/sdet-trace --direction backward --format matrix
```

### Execution History

```bash
# Import historical results for ML training
node scripts/import-history.js \
  --source ./junit-xml-history/ \
  --target artifacts/trends/history.json

# Train ML models with history
node scripts/ml-helpers.js train --type flake-detector --data artifacts/trends/history.json
```

---

## Breaking Changes

### v1.0 (Initial) - No Breaking Changes Yet

Future breaking changes will be documented here:

| Version | Change | Migration |
|---------|--------|-----------|
| v1.1 | Context schema v2 | Run `migrate.js` |
| v1.2 | Skill frontmatter v2 | Update skill files |
| v2.0 | Major architecture change | Fresh install recommended |

---

## Rollback Procedure

### If Migration Fails

```bash
# 1. Restore backup
rm -rf ~/.claude/skills/sdet
mv ~/.claude/skills/sdet.backup ~/.claude/skills/sdet

# 2. Restore project config
cp sdet.config.yaml.backup sdet.config.yaml

# 3. Restore context
cp .claude/context/sdet-context.json.backup .claude/context/sdet-context.json

# 4. Reinstall hooks
cd ~/.claude/skills/sdet
node scripts/install.js
```

### Partial Rollback (Single Skill)

```bash
# Revert specific skill to previous version
cd ~/.claude/skills/sdet
git checkout HEAD -- .claude/commands/sdet-analyze.md

# Re-validate
node scripts/validate-skills.js
```

---

## Validation Checklist

After migration, verify:

- [ ] All 51 skills install and run: `/sdet-* --help`
- [ ] Context passes between skills
- [ ] Orchestrator runs all workflows
- [ ] Excel round-trip preserves formatting
- [ ] Generated automation executes
- [ ] CI/CD pipelines work on target platform
- [ ] Traceability: req → test → auto → result → defect
- [ ] ML models load (if using)
- [ ] Self-healing creates valid PRs
- [ ] Synthetic monitors deploy
- [ ] Audit packages generate correctly
- [ ] Example projects run successfully

---

## Support

If migration issues persist:

1. Check [Troubleshooting Guide](troubleshooting.md)
2. Search [GitHub Issues](https://github.com/yourorg/sdet-skills/issues)
3. Create new issue with:
   - Source framework/version
   - Target SDET Skills version
   - Error messages
   - Minimal reproduction steps

---

*Migration Guide v1.0*
*Last Updated: 2026-10-22*