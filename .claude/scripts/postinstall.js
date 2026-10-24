/**
 * SDET Skills - Post-install Script
 * Runs after npm install to generate templates and validate
 */

const { execSync } = require('child_process');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..');

console.log('🔧 Running post-install tasks...\n');

try {
  // Generate Excel templates
  console.log('📊 Generating Excel templates...');
  execSync('node templates/excel/standard.xlsx.template.js', {
    cwd: TARGET_DIR,
    stdio: 'inherit'
  });
  console.log('✅ Excel templates generated\n');

  // Generate automation templates
  console.log('🤖 Generating automation templates...');
  execSync('node templates/automation/playwright/pom.template.js', {
    cwd: TARGET_DIR,
    stdio: 'inherit'
  });
  execSync('node templates/automation/k6/load-test.template.js', {
    cwd: TARGET_DIR,
    stdio: 'inherit'
  });
  console.log('✅ Automation templates generated\n');

  // Validate skills
  console.log('🔍 Validating skills...');
  execSync('node scripts/validate-skills.js', {
    cwd: TARGET_DIR,
    stdio: 'inherit'
  });
  console.log('✅ All skills validated\n');

  console.log('🎉 Post-install tasks completed successfully!');
} catch (e) {
  console.error('❌ Post-install tasks failed:', e.message);
  process.exit(1);
}