/**
 * SDET Skills - Skill Validation Script
 * Validates all skill definitions for correctness
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const COMMANDS_DIR = '.claude/commands';
const SKILL_SCHEMA = {
  type: 'object',
  required: ['name', 'description', 'arguments'],
  properties: {
    name: { type: 'string', pattern: '^sdet-[a-z-]+$' },
    description: { type: 'string', minLength: 10 },
    arguments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description', 'required'],
        properties: {
          name: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9-]*$' },
          description: { type: 'string', minLength: 5 },
          required: { type: 'boolean' },
          default: { type: ['string', 'number', 'boolean', 'null'] },
          enum: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

const validate = ajv.compile(SKILL_SCHEMA);

/**
 * Extract frontmatter from skill file
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    return yaml.load(match[1]);
  } catch (e) {
    throw new Error(`Invalid YAML frontmatter: ${e.message}`);
  }
}

/**
 * Validate a single skill file
 */
async function validateSkillFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    return { valid: false, errors: ['Missing frontmatter'] };
  }

  const valid = validate(frontmatter);
  const errors = valid ? [] : validate.errors.map(e =>
    `${e.instancePath || 'root'} ${e.message}`
  );

  // Additional checks
  const warnings = [];

  // Check name matches filename
  const expectedName = path.basename(filePath, '.md');
  if (frontmatter.name !== expectedName) {
    warnings.push(`Skill name "${frontmatter.name}" doesn't match filename "${expectedName}"`);
  }

  // Check for required sections in content
  const requiredSections = ['## Context', '## Instructions', '## Shared Context Keys', '## Arguments Reference', '## Output'];
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      warnings.push(`Missing recommended section: ${section}`);
    }
  }

  // Check for context loading instruction
  if (!content.includes('state-helpers.js load')) {
    warnings.push('Missing context load instruction');
  }

  // Check for context saving instruction
  if (!content.includes('state-helpers.js save')) {
    warnings.push('Missing context save instruction');
  }

  return { valid: valid && errors.length === 0, errors, warnings, frontmatter };
}

/**
 * Validate all skills
 */
async function validateAllSkills() {
  const files = await fs.readdir(COMMANDS_DIR);
  const skillFiles = files.filter(f => f.startsWith('sdet-') && f.endsWith('.md'));

  console.log(`Found ${skillFiles.length} skill files to validate\n`);

  const results = {
    total: skillFiles.length,
    valid: 0,
    invalid: 0,
    warnings: 0,
    details: []
  };

  for (const file of skillFiles.sort()) {
    const filePath = path.join(COMMANDS_DIR, file);
    const result = await validateSkillFile(filePath);

    results.details.push({ file, ...result });

    if (result.valid) {
      results.valid++;
      console.log(`✅ ${file}`);
    } else {
      results.invalid++;
      console.log(`❌ ${file}`);
      for (const error of result.errors) {
        console.log(`   Error: ${error}`);
      }
    }

    if (result.warnings.length > 0) {
      results.warnings += result.warnings.length;
      for (const warning of result.warnings) {
        console.log(`   ⚠️  ${warning}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${results.total} | Valid: ${results.valid} | Invalid: ${results.invalid} | Warnings: ${results.warnings}`);

  return results;
}

/**
 * Generate skill registry
 */
async function generateRegistry() {
  const files = await fs.readdir(COMMANDS_DIR);
  const skillFiles = files.filter(f => f.startsWith('sdet-') && f.endsWith('.md'));

  const registry = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    skills: {}
  };

  for (const file of skillFiles.sort()) {
    const filePath = path.join(COMMANDS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (frontmatter) {
      registry.skills[frontmatter.name] = {
        name: frontmatter.name,
        description: frontmatter.description,
        file,
        arguments: frontmatter.arguments || []
      };
    }
  }

  await fs.writeFile(
    path.join(COMMANDS_DIR, 'registry.json'),
    JSON.stringify(registry, null, 2)
  );

  console.log(`Registry generated: ${COMMANDS_DIR}/registry.json`);
  return registry;
}

/**
 * Check for duplicate skill names
 */
async function checkDuplicates() {
  const files = await fs.readdir(COMMANDS_DIR);
  const skillFiles = files.filter(f => f.startsWith('sdet-') && f.endsWith('.md'));

  const names = new Map();

  for (const file of skillFiles) {
    const content = await fs.readFile(path.join(COMMANDS_DIR, file), 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (frontmatter && frontmatter.name) {
      if (names.has(frontmatter.name)) {
        names.get(frontmatter.name).push(file);
      } else {
        names.set(frontmatter.name, [file]);
      }
    }
  }

  const duplicates = Array.from(names.entries()).filter(([_, files]) => files.length > 1);

  if (duplicates.length > 0) {
    console.log('\n⚠️  Duplicate skill names found:');
    for (const [name, files] of duplicates) {
      console.log(`   ${name}: ${files.join(', ')}`);
    }
    return false;
  }

  return true;
}

module.exports = {
  validateSkillFile,
  validateAllSkills,
  generateRegistry,
  checkDuplicates,
  extractFrontmatter
};

// CLI
if (require.main === module) {
  (async () => {
    try {
      const results = await validateAllSkills();
      await checkDuplicates();
      await generateRegistry();

      process.exit(results.invalid > 0 ? 1 : 0);
    } catch (error) {
      console.error('Validation error:', error.message);
      process.exit(1);
    }
  })();
}