/**
 * SDET Skills - State Management Helpers
 * Core utilities for loading, saving, and managing shared context
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CONTEXT_DIR = '.claude/context';
const CONTEXT_FILE = path.join(CONTEXT_DIR, 'sdet-context.json');
const STATE_DIR = '.sdet';
const STATE_FILE = path.join(STATE_DIR, 'state.json');

/**
 * Ensure context directory exists
 */
async function ensureContextDir() {
  await fs.mkdir(CONTEXT_DIR, { recursive: true });
  await fs.mkdir(STATE_DIR, { recursive: true });
}

/**
 * Generate unique run ID
 */
function generateRunId() {
  return `run-${Date.now()}-${uuidv4().slice(0, 8)}`;
}

/**
 * Load shared context from file
 * @returns {Promise<Object>} Context object
 */
async function loadContext() {
  await ensureContextDir();

  try {
    const content = await fs.readFile(CONTEXT_FILE, 'utf-8');
    const context = JSON.parse(content);

    // Ensure required structure
    if (!context.runId) {
      context.runId = generateRunId();
    }
    if (!context.startedAt) {
      context.startedAt = new Date().toISOString();
    }
    if (!context.sdet) {
      context.sdet = {};
    }

    return context;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // First run - create initial context
      const initialContext = {
        runId: generateRunId(),
        startedAt: new Date().toISOString(),
        lastSkill: null,
        updatedAt: new Date().toISOString(),
        sdet: {}
      };
      await saveContextRaw(initialContext);
      return initialContext;
    }
    throw error;
  }
}

/**
 * Save context to file (raw - no skill namespace)
 * @param {Object} context - Full context object
 */
async function saveContextRaw(context) {
  await ensureContextDir();
  context.updatedAt = new Date().toISOString();
  await fs.writeFile(CONTEXT_FILE, JSON.stringify(context, null, 2));
}

/**
 * Save skill output to shared context
 * @param {string} skillName - Name of the skill (e.g., 'analyze', 'generate')
 * @param {Object} output - Skill output to save
 */
async function saveContext(skillName, output) {
  const context = await loadContext();

  // Update skill-specific namespace
  context.sdet[skillName] = {
    ...context.sdet[skillName],
    ...output,
    completedAt: new Date().toISOString()
  };

  // Update orchestration tracking
  context.lastSkill = skillName;
  context.updatedAt = new Date().toISOString();

  // Track skill execution in run history
  if (!context.sdet.run) {
    context.sdet.run = {
      id: context.runId,
      workflow: 'unknown',
      status: 'running',
      startedAt: context.startedAt,
      skills: []
    };
  }

  const existingSkillIndex = context.sdet.run.skills.findIndex(s => s.skill === skillName);
  const skillRecord = {
    skill: skillName,
    status: 'completed',
    duration: 0, // Would be calculated by orchestrator
    completedAt: new Date().toISOString()
  };

  if (existingSkillIndex >= 0) {
    context.sdet.run.skills[existingSkillIndex] = skillRecord;
  } else {
    context.sdet.run.skills.push(skillRecord);
  }

  await saveContextRaw(context);
  return context;
}

/**
 * Get value from context by dot-notation path
 * @param {Object} context - Context object
 * @param {string} path - Dot-notation path (e.g., 'sdet.requirements.path')
 * @returns {*} Value at path or undefined
 */
function getContextValue(context, path) {
  const keys = path.split('.');
  let value = context;

  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }

  return value;
}

/**
 * Set value in context by dot-notation path
 * @param {Object} context - Context object
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 * @returns {Object} Updated context
 */
function setContextValue(context, path, value) {
  const keys = path.split('.');
  let current = context;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return context;
}

/**
 * Delete value from context by path
 * @param {Object} context - Context object
 * @param {string} path - Dot-notation path
 * @returns {boolean} True if deleted
 */
function deleteContextValue(context, path) {
  const keys = path.split('.');
  let current = context;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) return false;
    current = current[keys[i]];
  }

  return delete current[keys[keys.length - 1]];
}

/**
 * Get all keys matching a prefix
 * @param {Object} context - Context object
 * @param {string} prefix - Prefix to match (e.g., 'sdet.analyze')
 * @returns {Object} Matching key-value pairs
 */
function getContextByPrefix(context, prefix) {
  const result = {};
  const prefixParts = prefix.split('.');

  function traverse(obj, currentPath) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (newPath.startsWith(prefix)) {
        result[newPath] = value;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        traverse(value, newPath);
      }
    }
  }

  traverse(context, '');
  return result;
}

/**
 * Clear skill-specific context (for cleanup)
 * @param {string} skillName - Skill name to clear
 */
async function clearSkillContext(skillName) {
  const context = await loadContext();
  delete context.sdet[skillName];
  await saveContextRaw(context);
}

/**
 * Reset entire context (new run)
 * @param {string} workflow - Workflow name
 * @returns {Object} New context
 */
async function resetContext(workflow = 'full') {
  await ensureContextDir();

  const newContext = {
    runId: generateRunId(),
    startedAt: new Date().toISOString(),
    lastSkill: null,
    updatedAt: new Date().toISOString(),
    sdet: {
      run: {
        id: generateRunId(),
        workflow,
        status: 'running',
        startedAt: new Date().toISOString(),
        skills: []
      }
    }
  };

  await saveContextRaw(newContext);
  return newContext;
}

/**
 * Get context summary for logging
 * @param {Object} context - Context object
 * @returns {Object} Summary
 */
function getContextSummary(context) {
  return {
    runId: context.runId,
    startedAt: context.startedAt,
    lastSkill: context.lastSkill,
    updatedAt: context.updatedAt,
    skills: Object.keys(context.sdet || {}).filter(k => k !== 'run'),
    run: context.sdet?.run ? {
      workflow: context.sdet.run.workflow,
      status: context.sdet.run.status,
      skillsCount: context.sdet.run.skills?.length || 0
    } : null
  };
}

/**
 * Validate context has required keys for a skill
 * @param {Object} context - Context object
 * @param {string} skillName - Skill name
 * @returns {Object} Validation result { valid: boolean, missing: string[] }
 */
function validateContextForSkill(context, skillName) {
  const requiredKeys = {
    analyze: [],
    generate: ['sdet.requirements.path', 'sdet.requirements.count'],
    validate: ['sdet.testcases.path'],
    automate: ['sdet.testcases.path', 'sdet.validation.status'],
    execute: ['sdet.automation.files', 'sdet.automation.types'],
    'analyze-results': ['sdet.execution.results.path', 'sdet.testcases.path'],
    deploy: ['sdet.automation.files', 'sdet.automation.types'],
    orchestrate: []
  };

  const required = requiredKeys[skillName] || [];
  const missing = required.filter(key => getContextValue(context, key) === undefined);

  return {
    valid: missing.length === 0,
    missing
  };
}

module.exports = {
  loadContext,
  saveContext,
  saveContextRaw,
  getContextValue,
  setContextValue,
  deleteContextValue,
  getContextByPrefix,
  clearSkillContext,
  resetContext,
  getContextSummary,
  validateContextForSkill,
  generateRunId,
  CONTEXT_FILE,
  STATE_FILE
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  (async () => {
    try {
      switch (command) {
        case 'load': {
          const context = await loadContext();
          console.log(JSON.stringify(context, null, 2));
          break;
        }
        case 'save': {
          const skillName = args[0];
          const output = JSON.parse(args[1] || '{}');
          await saveContext(skillName, output);
          console.log(`Saved context for ${skillName}`);
          break;
        }
        case 'get': {
          const context = await loadContext();
          const path = args[0];
          const value = getContextValue(context, path);
          console.log(JSON.stringify(value, null, 2));
          break;
        }
        case 'set': {
          const context = await loadContext();
          const path = args[0];
          const value = JSON.parse(args[1] || 'null');
          setContextValue(context, path, value);
          await saveContextRaw(context);
          console.log(`Set ${path}`);
          break;
        }
        case 'reset': {
          const workflow = args[0] || 'full';
          await resetContext(workflow);
          console.log(`Reset context for workflow: ${workflow}`);
          break;
        }
        case 'summary': {
          const context = await loadContext();
          console.log(JSON.stringify(getContextSummary(context), null, 2));
          break;
        }
        case 'validate': {
          const context = await loadContext();
          const skillName = args[0];
          const result = validateContextForSkill(context, skillName);
          console.log(JSON.stringify(result, null, 2));
          process.exit(result.valid ? 0 : 1);
        }
        default: {
          console.log('Usage: node state-helpers.js <command> [args]');
          console.log('Commands: load, save <skill> <json>, get <path>, set <path> <json>, reset [workflow], summary, validate <skill>');
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}