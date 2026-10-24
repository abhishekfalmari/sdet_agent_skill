/**
 * SDET Skills - Lint Script
 * Lints skill files for style and best practices
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const COMMANDS_DIR = '.claude/commands';

/**
 * Lint a single skill file
 */
async function lintSkillFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const issues = [];

  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let frontmatter = null;
  if (fmMatch) {
    try {
      frontmatter = yaml.load(fmMatch[1]);
    } catch (e) {
      issues.push({ level: 'error', message: `Invalid YAML: ${e.message}`, line: 1 });
    }
  }

  const lines = content.split('\n');

  // Check line lengths
  lines.forEach((line, i) => {
    if (line.length > 120) {
      issues.push({ level: 'warning', message: `Line ${i + 1} exceeds 120 characters (${line.length})`, line: i + 1 });
    }
  });

  // Check for trailing whitespace
  lines.forEach((line, i) => {
    if (line.match(/\s+$/)) {
      issues.push({ level: 'warning', message: `Line ${i + 1} has trailing whitespace`, line: i + 1 });
    }
  });

  // Check frontmatter fields
  if (frontmatter) {
    if (!frontmatter.name) {
      issues.push({ level: 'error', message: 'Missing required field: name', line: 1 });
    } else if (!frontmatter.name.match(/^sdet-[a-z-]+$/)) {
      issues.push({ level: 'error', message: `Invalid name format: ${frontmatter.name} (must match sdet-[a-z-]+)`, line: 1 });
    }

    if (!frontmatter.description || frontmatter.description.length < 10) {
      issues.push({ level: 'error', message: 'Description too short (min 10 chars)', line: 1 });
    }

    if (!frontmatter.arguments || !Array.isArray(frontmatter.arguments)) {
      issues.push({ level: 'error', message: 'Missing or invalid arguments array', line: 1 });
    } else {
      frontmatter.arguments.forEach((arg, idx) => {
        if (!arg.name) {
          issues.push({ level: 'error', message: `Argument ${idx}: missing name`, line: 1 });
        }
        if (!arg.description || arg.description.length < 5) {
          issues.push({ level: 'warning', message: `Argument ${arg.name}: description too short`, line: 1 });
        }
        if (typeof arg.required !== 'boolean') {
          issues.push({ level: 'error', message: `Argument ${arg.name}: required must be boolean`, line: 1 });
        }
      });
    }
  }

  // Check content structure
  const requiredSections = [
    '## Context',
    '## Instructions',
    '## Shared Context Keys',
    '## Arguments Reference',
    '## Output'
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      issues.push({ level: 'warning', message: `Missing recommended section: ${section}`, line: 1 });
    }
  }

  // Check for common patterns
  if (!content.includes('state-helpers.js load')) {
    issues.push({ level: 'warning', message: 'Missing context load instruction (state-helpers.js load)', line: 1 });
  }

  if (!content.includes('state-helpers.js save')) {
    issues.push({ level: 'warning', message: 'Missing context save instruction (state-helpers.js save)', line: 1 });
  }

  // Check for example usage
  if (!content.includes('## Example Usage')) {
    issues.push({ level: 'info', message: 'Consider adding Example Usage section', line: 1 });
  }

  // Check for implementation notes
  if (!content.includes('## Implementation Notes')) {
    issues.push({ level: 'info', message: 'Consider adding Implementation Notes section', line: 1 });
  }

  // Check markdown formatting
  let inCodeBlock = false;
  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock) {
      // Check for proper heading hierarchy
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        if (level > 3 && i > 10) {
          issues.push({ level: 'info', message: `Deep heading level (h${level}) at line ${i + 1}`, line: i + 1 });
        }
      }
    }
  });

  return { file: path.basename(filePath), issues };
}

/**
 * Lint all skill files
 */
async function lintAllSkills() {
  const files = await fs.readdir(COMMANDS_DIR);
  const skillFiles = files.filter(f => f.startsWith('sdet-') && f.endsWith('.md'));

  console.log(`Linting ${skillFiles.length} skill files...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfos = 0;

  for (const file of skillFiles.sort()) {
    const filePath = path.join(COMMANDS_DIR, file);
    const result = await lintSkillFile(filePath);

    const errors = result.issues.filter(i => i.level === 'error').length;
    const warnings = result.issues.filter(i => i.level === 'warning').length;
    const infos = result.issues.filter(i => i.level === 'info').length;

    totalErrors += errors;
    totalWarnings += warnings;
    totalInfos += infos;

    if (errors > 0 || warnings > 0 || infos > 0) {
      console.log(`${file}:`);
      for (const issue of result.issues) {
        const prefix = issue.level === 'error' ? '❌' : issue.level === 'warning' ? '⚠️' : 'ℹ️';
        const lineInfo = issue.line ? ` (line ${issue.line})` : '';
        console.log(`  ${prefix} ${issue.message}${lineInfo}`);
      }
      console.log('');
    } else {
      console.log(`✅ ${file}`);
    }
  }

  console.log('='.repeat(50));
  console.log(`Total: ${skillFiles.length} files | Errors: ${totalErrors} | Warnings: ${totalWarnings} | Info: ${totalInfos}`);

  return { totalErrors, totalWarnings, totalInfos };
}

module.exports = { lintSkillFile, lintAllSkills };

// CLI
if (require.main === module) {
  (async () => {
    try {
      const results = await lintAllSkills();
      process.exit(results.totalErrors > 0 ? 1 : 0);
    } catch (error) {
      console.error('Lint error:', error.message);
      process.exit(1);
    }
  })();
}