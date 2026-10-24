/**
 * SDET Skills - Build Script
 * Builds the skill pack for distribution
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

async function build() {
  console.log('🔨 Building SDET Skills package\n');

  // Clean dist directory
  try {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
  } catch (e) {}

  await fs.mkdir(DIST_DIR, { recursive: true });

  // Read package.json for version
  const packageJson = JSON.parse(await fs.readFile(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
  const version = packageJson.version;

  const packageName = `sdet-skills-${version}`;
  const packageDir = path.join(DIST_DIR, packageName);

  // Copy files
  console.log('📦 Copying files...');
  await copyDir(ROOT_DIR, packageDir, [
    'node_modules',
    '.git',
    'artifacts',
    '.claude/context',
    '*.log',
    '*.tmp',
    'dist',
    'coverage',
    '.DS_Store',
    '*.tgz'
  ]);

  // Generate templates
  console.log('📊 Generating templates...');
  try {
    execSync('node templates/excel/standard.xlsx.template.js', { cwd: packageDir, stdio: 'inherit' });
    execSync('node templates/automation/playwright/pom.template.js', { cwd: packageDir, stdio: 'inherit' });
    execSync('node templates/automation/k6/load-test.template.js', { cwd: packageDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️  Some templates could not be generated:', e.message);
  }

  // Validate
  console.log('🔍 Validating...');
  try {
    execSync('node scripts/validate-skills.js', { cwd: packageDir, stdio: 'inherit' });
    execSync('node scripts/lint-skills.js', { cwd: packageDir, stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️  Validation issues:', e.message);
  }

  // Install production dependencies
  console.log('📦 Installing production dependencies...');
  execSync('npm ci --production', { cwd: packageDir, stdio: 'inherit' });

  // Create tarball
  console.log('📦 Creating tarball...');
  const tarballPath = path.join(DIST_DIR, `${packageName}.tgz`);
  await createTarball(packageDir, tarballPath);

  // Create zip
  console.log('📦 Creating zip...');
  const zipPath = path.join(DIST_DIR, `${packageName}.zip`);
  await createZip(packageDir, zipPath);

  // Generate checksums
  console.log('🔐 Generating checksums...');
  await generateChecksums(DIST_DIR, packageName);

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Build complete: ${packageName}`);
  console.log(`📁 Output: ${DIST_DIR}`);
  console.log(`   - ${packageName}.tgz`);
  console.log(`   - ${packageName}.zip`);
  console.log(`   - ${packageName}.sha256`);
  console.log(`   - ${packageName}.sha512`);
}

async function copyDir(src, dest, excludePatterns = []) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  await fs.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    const shouldExclude = excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(entry.name);
      }
      return entry.name === pattern;
    });

    if (shouldExclude) continue;

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, excludePatterns);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function createTarball(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('tar', { gzip: true, gzipOptions: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function createZip(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function generateChecksums(distDir, packageName) {
  const crypto = require('crypto');

  for (const ext of ['.tgz', '.zip']) {
    const filePath = path.join(distDir, `${packageName}${ext}`);
    const content = await fs.readFile(filePath);

    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    const sha512 = crypto.createHash('sha512').update(content).digest('hex');

    await fs.writeFile(path.join(distDir, `${packageName}.sha256`), `${sha256}  ${packageName}${ext}\n`);
    await fs.writeFile(path.join(distDir, `${packageName}.sha512`), `${sha512}  ${packageName}${ext}\n`);
  }
}

module.exports = { build };

// CLI
if (require.main === module) {
  build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
}