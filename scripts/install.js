/**
 * SDET Skills - Installation Script
 * Installs the skill pack for Claude Code
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const CLAUDE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');
const SKILLS_DIR = path.join(CLAUDE_DIR, 'skills');
const TARGET_DIR = path.join(SKILLS_DIR, 'sdet');

async function install() {
  console.log('🚀 Installing SDET Skills for Claude Code\n');

  // Check if running from skill pack directory
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(await fsPromises.readFile(packageJsonPath, 'utf-8'));

  console.log(`Version: ${packageJson.version}`);
  console.log(`Source: ${__dirname}`);
  console.log(`Target: ${TARGET_DIR}\n`);

  // Create skills directory
  await fsPromises.mkdir(SKILLS_DIR, { recursive: true });

  // Remove existing installation
  try {
    await fsPromises.rm(TARGET_DIR, { recursive: true, force: true });
    console.log('✅ Removed existing installation');
  } catch (e) {
    // Directory might not exist
  }

  // Copy skill pack
  const sourceDir = path.join(__dirname, '..');
  await copyDir(sourceDir, sourceDir, TARGET_DIR, [
    'node_modules',
    '.git',
    'artifacts',
    '.claude/context',
    '*.log',
    '*.tmp',
    'dist',
    'coverage'
  ]);

  console.log('✅ Copied skill pack files');

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  try {
    // Clean up any existing node_modules to avoid ENOTEMPTY errors on Windows
    const nodeModulesPath = path.join(TARGET_DIR, 'node_modules');
    try {
      await fsPromises.rm(nodeModulesPath, { recursive: true, force: true });
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Use npm install if no lockfile, otherwise npm ci
    const lockFile = path.join(TARGET_DIR, 'package-lock.json');
    const hasLockFile = fs.existsSync(lockFile);
    const cmd = hasLockFile ? 'npm ci' : 'npm install --legacy-peer-deps';
    execSync(cmd, { cwd: TARGET_DIR, stdio: 'inherit', timeout: 300000 });
    console.log('✅ Dependencies installed');
  } catch (e) {
    console.error('❌ Failed to install dependencies:', e.message);
    process.exit(1);
  }

  // Generate Excel templates
  console.log('\n📊 Generating Excel templates...');
  try {
    execSync('node templates/excel/standard.xlsx.template.js', { cwd: TARGET_DIR, stdio: 'inherit' });
    console.log('✅ Excel templates generated');
  } catch (e) {
    console.warn('⚠️  Could not generate Excel templates:', e.message);
  }

  // Generate automation templates
  console.log('\n🤖 Generating automation templates...');
  try {
    execSync('node templates/automation/playwright/pom.template.js', { cwd: TARGET_DIR, stdio: 'inherit' });
    execSync('node templates/automation/k6/load-test.template.js', { cwd: TARGET_DIR, stdio: 'inherit' });
    console.log('✅ Automation templates generated');
  } catch (e) {
    console.warn('⚠️  Could not generate automation templates:', e.message);
  }

  // Validate skills
  console.log('\n🔍 Validating skills...');
  try {
    execSync('node scripts/validate-skills.js', { cwd: TARGET_DIR, stdio: 'inherit' });
    console.log('✅ All skills validated');
  } catch (e) {
    console.warn('⚠️  Some skills failed validation:', e.message);
  }

  // Fix skill file paths to use absolute script paths
  console.log('\n🔧 Fixing skill file script paths...');
  await fixSkillScriptPaths();
  console.log('✅ Skill paths fixed');

  // Create hook configuration
  console.log('\n🔧 Configuring hooks...');
  await setupHooks();
  console.log('✅ Hooks configured');

  // Verify installation
  console.log('\n✅ Verifying installation...');
  await verifyInstallation();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 SDET Skills installed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart Claude Code');
  console.log('2. Run `/sdet-analyze --help` to verify');
  console.log('3. Add requirements to ./requirements/');
  console.log('4. Run `/sdet-orchestrate --workflow quick --autoApprove`');
  console.log('\n📚 Documentation: https://github.com/yourorg/sdet-skills/docs');
}

async function copyDir(src, srcRoot, dest, excludePatterns = []) {
  const entries = await fsPromises.readdir(src, { withFileTypes: true });

  await fsPromises.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relativePath = path.relative(srcRoot, srcPath);

    // Check exclude patterns
    const shouldExclude = excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(entry.name) || regex.test(relativePath);
      }
      return entry.name === pattern || relativePath === pattern;
    });

    if (shouldExclude) continue;

    if (entry.isDirectory()) {
      await copyDir(srcPath, srcRoot, destPath, excludePatterns);
    } else {
      await fsPromises.copyFile(srcPath, destPath);
    }
  }
}

async function setupHooks() {
  const hooksDir = path.join(TARGET_DIR, '.claude', 'hooks');
  const settingsPath = path.join(TARGET_DIR, '.claude', 'settings.json');
  const scriptsDir = path.join(TARGET_DIR, 'scripts').replace(/\\/g, '/');

  // Ensure hooks directory exists
  await fsPromises.mkdir(hooksDir, { recursive: true });

  // State persistence hook
  await fsPromises.writeFile(path.join(hooksDir, 'sdet-state.json'), JSON.stringify({
    hooks: {
      PreToolUse: [{
        matcher: 'sdet-*',
        command: `node ${scriptsDir}/state-helpers.js load`
      }],
      PostToolUse: [{
        matcher: 'sdet-*',
        command: `node ${scriptsDir}/state-helpers.js save`
      }]
    }
  }, null, 2));

  // Context passing hook
  await fsPromises.writeFile(path.join(hooksDir, 'sdet-context.json'), JSON.stringify({
    hooks: {
      PostToolUse: [{
        matcher: 'sdet-*',
        command: `node ${scriptsDir}/context-helpers.js export`
      }]
    }
  }, null, 2));

  // Checkpoint hook
  await fsPromises.writeFile(path.join(hooksDir, 'sdet-checkpoint.json'), JSON.stringify({
    hooks: {
      PostToolUse: [{
        matcher: 'sdet-orchestrate',
        command: `node ${scriptsDir}/checkpoint-helpers.js save`
      }]
    }
  }, null, 2));

  // Notification hook
  await fsPromises.writeFile(path.join(hooksDir, 'sdet-notify.json'), JSON.stringify({
    hooks: {
      PostToolUse: [{
        matcher: 'sdet-*',
        command: `node ${scriptsDir}/notify-helpers.js notify`
      }]
    }
  }, null, 2));

  // Settings
  await fsPromises.writeFile(settingsPath, JSON.stringify({
    permissions: {
      allow: [
        'Bash(npx sdet-*)',
        `Bash(node ${scriptsDir}/*)`,
        'Read(.claude/context/**)',
        'Write(.claude/context/**)',
        'Write(artifacts/**)',
        'Read(artifacts/**)',
        'Glob(**)',
        'Grep(**)'
      ]
    },
    hooks: {
      PreToolUse: [
        { matcher: 'sdet-*', command: `node ${scriptsDir}/state-helpers.js load` }
      ],
      PostToolUse: [
        { matcher: 'sdet-*', command: `node ${scriptsDir}/state-helpers.js save` },
        { matcher: 'sdet-*', command: `node ${scriptsDir}/context-helpers.js export` }
      ]
    }
  }, null, 2));
}

async function verifyInstallation() {
  // Check required files
  const requiredFiles = [
    '.claude/commands/sdet-analyze.md',
    '.claude/commands/sdet-generate.md',
    '.claude/commands/sdet-validate.md',
    '.claude/commands/sdet-automate.md',
    '.claude/commands/sdet-execute.md',
    '.claude/commands/sdet-analyze-results.md',
    '.claude/commands/sdet-deploy.md',
    '.claude/commands/sdet-orchestrate.md',
    'scripts/state-helpers.js',
    'scripts/context-helpers.js',
    'scripts/checkpoint-helpers.js',
    'scripts/notify-helpers.js',
    'templates/excel/standard.xlsx',
    'package.json'
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(TARGET_DIR, file);
    try {
      await fsPromises.access(filePath);
      console.log(`  ✅ ${file}`);
    } catch (e) {
      console.log(`  ❌ ${file} - MISSING`);
      allExist = false;
    }
  }

  if (!allExist) {
    console.warn('\n⚠️  Some files are missing. Installation may be incomplete.');
  }

  // Check CLI commands work
  try {
    execSync('npx sdet-analyze --help', { cwd: TARGET_DIR, stdio: 'pipe', timeout: 10000 });
    console.log('\n  ✅ CLI commands working');
  } catch (e) {
    console.warn('\n  ⚠️  CLI commands may not work correctly');
  }
}

// Run if executed directly
if (require.main === module) {
  install().catch(err => {
    console.error('Installation failed:', err);
    process.exit(1);
  });
}

module.exports = { install };

async function fixSkillScriptPaths() {
  const commandsDir = path.join(TARGET_DIR, '.claude', 'commands');
  const scriptsDir = path.join(TARGET_DIR, 'scripts').replace(/\\/g, '/');

  try {
    const files = await fsPromises.readdir(commandsDir);
    for (const file of files) {
      if (file.endsWith('.md') && file.startsWith('sdet-')) {
        const filePath = path.join(commandsDir, file);
        let content = await fsPromises.readFile(filePath, 'utf-8');

        // Replace .claude/scripts/ with absolute scripts path
        const oldPath = '.claude/scripts/';
        const newPath = `${scriptsDir}/`;

        if (content.includes(oldPath)) {
          content = content.split(oldPath).join(newPath);
          await fsPromises.writeFile(filePath, content, 'utf-8');
        }
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not fix all skill paths:', e.message);
  }
}