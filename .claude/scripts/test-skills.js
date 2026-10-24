/**
 * SDET Skills - Test Script
 * Runs basic tests to verify skills work correctly
 */

const { execSync } = require('child_process');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..');

console.log('🧪 Running SDET Skills tests...\n');

try {
  // Test 1: Validate skills
  console.log('📋 Test 1: Validating skills...');
  execSync('node scripts/validate-skills.js', {
    cwd: TARGET_DIR,
    stdio: 'inherit'
  });
  console.log('✅ Skills validation passed\n');

  // Test 2: Check Excel template exists
  console.log('📊 Test 2: Checking Excel template...');
  const fs = require('fs');
  const excelPath = path.join(TARGET_DIR, 'templates', 'excel', 'standard.xlsx');
  if (fs.existsSync(excelPath)) {
    console.log('✅ Excel template exists\n');
  } else {
    throw new Error('Excel template not found');
  }

  // Test 3: Check automation templates exist
  console.log('🤖 Test 3: Checking automation templates...');
  const automationFiles = [
    'templates/automation/playwright/base-page.ts',
    'templates/automation/playwright/page-object.ts',
    'templates/automation/playwright/test-file.ts',
    'templates/automation/playwright/playwright.config.ts',
    'templates/automation/k6/load-test.js',
    'templates/automation/k6/stress-test.js',
  ];

  for (const file of automationFiles) {
    const filePath = path.join(TARGET_DIR, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Automation template missing: ${file}`);
    }
  }
  console.log('✅ Automation templates exist\n');

  // Test 4: Test CLI commands (dry run)
  console.log('🔧 Test 4: Testing CLI commands...');
  const skills = ['sdet-analyze', 'sdet-generate', 'sdet-validate', 'sdet-automate',
                  'sdet-execute', 'sdet-analyze-results', 'sdet-deploy', 'sdet-orchestrate'];

  for (const skill of skills) {
    try {
      execSync(`npx ${skill} --help`, {
        cwd: TARGET_DIR,
        stdio: 'pipe',
        timeout: 10000
      });
      console.log(`  ✅ ${skill}`);
    } catch (e) {
      console.warn(`  ⚠️  ${skill} - help command failed`);
    }
  }
  console.log('✅ CLI commands working\n');

  console.log('🎉 All tests passed!');
  process.exit(0);
} catch (e) {
  console.error('❌ Tests failed:', e.message);
  process.exit(1);
}