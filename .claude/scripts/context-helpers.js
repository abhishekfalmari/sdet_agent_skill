/**
 * SDET Skills - Context Helpers
 * Skill-specific context import/export/filtering
 */

const { loadContext, saveContext, getContextValue, validateContextForSkill } = require('./state-helpers.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Skill-to-context-key mapping
 * Each skill only needs specific context keys
 */
const SKILL_CONTEXT_MAP = {
  // Core pipeline
  analyze: {
    imports: [],
    exports: ['requirements.count', 'requirements.path', 'traceability.path']
  },
  generate: {
    imports: ['requirements.count', 'requirements.path', 'traceability.path'],
    exports: ['testcases.count', 'testcases.path', 'testcases.template']
  },
  validate: {
    imports: ['testcases.path', 'testcases.count'],
    exports: ['validation.status', 'validation.report.path', 'validation.annotated.path']
  },
  automate: {
    imports: ['testcases.path', 'validation.status', 'validation.annotated.path'],
    exports: ['automation.files', 'automation.types', 'automation.framework', 'automation.pattern']
  },
  execute: {
    imports: ['automation.files', 'automation.types', 'automation.framework'],
    exports: ['execution.results.path', 'execution.summary', 'execution.artifacts', 'execution.flakyTests']
  },
  'analyze-results': {
    imports: ['execution.results.path', 'execution.summary', 'testcases.path', 'validation.annotated.path'],
    exports: ['results.updatedExcel.path', 'results.defects', 'results.traceability.path', 'results.trends.path', 'results.analysisReport.path']
  },
  deploy: {
    imports: ['automation.files', 'automation.types', 'execution.summary'],
    exports: ['pipeline.path', 'pipeline.platform', 'pipeline.stages', 'pipeline.qualityGates']
  },
  orchestrate: {
    imports: [],
    exports: ['run.id', 'run.workflow', 'run.status', 'run.startedAt', 'run.completedAt', 'run.checkpoint', 'run.skills']
  },

  // Test Design & Planning
  plan: {
    imports: ['requirements.path', 'requirements.count'],
    exports: ['plan.path', 'plan.type', 'plan.risks']
  },
  estimate: {
    imports: ['testcases.path', 'testcases.count', 'requirements.path'],
    exports: ['estimate.hours', 'estimate.breakdown', 'estimate.confidence']
  },
  prioritize: {
    imports: ['testcases.path', 'requirements.path', 'execution.summary'],
    exports: ['prioritize.ordered', 'prioritize.skipped', 'prioritize.rationale']
  },
  coverage: {
    imports: ['testcases.path', 'requirements.path', 'execution.results.path', 'automation.files'],
    exports: ['coverage.code', 'coverage.requirement', 'coverage.gaps']
  },
  trace: {
    imports: ['requirements.path', 'testcases.path', 'automation.files', 'execution.results.path', 'results.defects'],
    exports: ['trace.matrix.path', 'trace.graph.path', 'trace.orphans']
  },
  review: {
    imports: ['testcases.path', 'validation.annotated.path'],
    exports: ['review.status', 'review.comments', 'review.approved']
  },

  // Test Data & Environments
  data: {
    imports: ['testcases.path', 'requirements.path'],
    exports: ['data.paths', 'data.schemas', 'data.version']
  },
  mask: {
    imports: ['data.paths', 'data.schemas'],
    exports: ['mask.path', 'mask.audit.path', 'mask.rules.applied']
  },
  mock: {
    imports: ['requirements.path', 'testcases.path'],
    exports: ['mock.services', 'mock.configs', 'mock.endpoints']
  },
  env: {
    imports: ['requirements.path', 'testcases.path', 'data.paths'],
    exports: ['env.url', 'env.credentials', 'env.status', 'env.spec']
  },
  seed: {
    imports: ['data.paths', 'data.schemas', 'env.url'],
    exports: ['seed.scripts', 'seed.status', 'seed.verification']
  },

  // Specialized Testing
  ui: {
    imports: ['automation.files', 'testcases.path'],
    exports: ['ui.results.path', 'ui.diffs', 'ui.approved']
  },
  mobile: {
    imports: ['testcases.path', 'requirements.path'],
    exports: ['mobile.tests', 'mobile.devices', 'mobile.framework']
  },
  'api-fuzz': {
    imports: ['requirements.path', 'testcases.path'],
    exports: ['api-fuzz.findings', 'api-fuzz.crashes', 'api-fuzz.coverage']
  },
  contract: {
    imports: ['requirements.path', 'testcases.path'],
    exports: ['contract.consumer', 'contract.provider', 'contract.matrix']
  },
  chaos: {
    imports: ['requirements.path', 'env.spec'],
    exports: ['chaos.experiments', 'chaos.results', 'chaos.improvements']
  },
  load: {
    imports: ['requirements.path', 'testcases.path', 'automation.files'],
    exports: ['load.report.path', 'load.bottlenecks', 'load.capacity']
  },
  'perf-profile': {
    imports: ['load.report.path', 'execution.results.path'],
    exports: ['perf-profile.bottlenecks', 'perf-profile.flamegraphs', 'perf-profile.recommendations']
  },
  security: {
    imports: ['requirements.path', 'testcases.path', 'automation.files'],
    exports: ['security.findings', 'security.by-severity', 'security.remediation']
  },
  accessibility: {
    imports: ['requirements.path', 'testcases.path', 'automation.files'],
    exports: ['accessibility.violations', 'accessibility.vpat.path', 'accessibility.score']
  },
  compliance: {
    imports: ['requirements.path', 'testcases.path', 'data.paths'],
    exports: ['compliance.report.path', 'compliance.evidence.path', 'compliance.gaps']
  },
  explore: {
    imports: ['requirements.path', 'testcases.path'],
    exports: ['explore.sessions', 'explore.bugs', 'explore.coverage']
  },
  usability: {
    imports: ['requirements.path', 'testcases.path'],
    exports: ['usability.metrics', 'usability.findings', 'usability.recordings']
  },

  // Quality Intelligence
  flake: {
    imports: ['execution.results.path', 'execution.summary', 'execution.flakyTests'],
    exports: ['flake.flaky', 'flake.quarantined', 'flake.fix-suggestions']
  },
  mutate: {
    imports: ['automation.files', 'execution.results.path'],
    exports: ['mutate.score', 'mutate.survivors', 'mutate.improvements']
  },
  predict: {
    imports: ['execution.results.path', 'testcases.path', 'automation.files'],
    exports: ['predict.probabilities', 'predict.recommended-subset', 'predict.risk-heatmap']
  },
  autoheal: {
    imports: ['execution.results.path', 'execution.flakyTests', 'automation.files'],
    exports: ['autoheal.fixed', 'autoheal.confidence', 'autoheal.prs']
  },
  rootcause: {
    imports: ['execution.results.path', 'execution.flakyTests', 'results.defects'],
    exports: ['rootcause.report.path', 'rootcause.cause', 'rootcause.fix']
  },
  insights: {
    imports: ['execution.results.path', 'execution.summary', 'results.defects', 'results.trends.path'],
    exports: ['insights.dashboard.url', 'insights.kpis', 'insights.alerts']
  },

  // Defect & Release
  defect: {
    imports: ['execution.results.path', 'results.defects', 'testcases.path'],
    exports: ['defect.created', 'defect.verified', 'defect.report.path']
  },
  triage: {
    imports: ['defect.created', 'results.defects', 'automation.files'],
    exports: ['triage.decisions', 'triage.assignments', 'triage.duplicates']
  },
  release: {
    imports: ['execution.summary', 'results.defects', 'results.traceability.path', 'coverage.code'],
    exports: ['release.decision', 'release.rationale', 'release.conditions']
  },
  rollback: {
    imports: ['release.decision', 'execution.summary', 'env.spec'],
    exports: ['rollback.config', 'rollback.triggers', 'rollback.last-executed']
  },

  // Platform & Integration
  'service-map': {
    imports: ['requirements.path', 'automation.files', 'execution.results.path'],
    exports: ['service-map.graph', 'service-map.impact', 'service-map.visualization']
  },
  migrate: {
    imports: ['automation.files', 'testcases.path'],
    exports: ['migrate.files', 'migrate.report.path', 'migrate.unverified']
  },
  backport: {
    imports: ['automation.files', 'testcases.path'],
    exports: ['backport.prs', 'backport.validated', 'backport.failed']
  },
  monitor: {
    imports: ['testcases.path', 'automation.files', 'execution.results.path'],
    exports: ['monitor.checks', 'monitor.dashboards', 'monitor.alerts']
  },

  // Team & Process
  dashboard: {
    imports: ['requirements.path', 'testcases.path', 'execution.results.path', 'results.traceability.path'],
    exports: ['dashboard.url', 'dashboard.version', 'dashboard.sections']
  },
  retro: {
    imports: ['execution.summary', 'results.defects', 'results.trends.path'],
    exports: ['retro.findings', 'retro.actions', 'retro.metrics']
  },
  onboard: {
    imports: ['requirements.path', 'testcases.path', 'automation.files', 'execution.results.path'],
    exports: ['onboard.portal.url', 'onboard.modules', 'onboard.assessment']
  },
  governance: {
    imports: ['testcases.path', 'automation.files', 'execution.results.path'],
    exports: ['governance.violations', 'governance.score', 'governance.fix-prs']
  },
  audit: {
    imports: ['testcases.path', 'execution.results.path', 'results.defects', 'results.traceability.path'],
    exports: ['audit.package.path', 'audit.matrix.path', 'audit.controls']
  },
  report: {
    imports: ['execution.summary', 'results.defects', 'results.traceability.path', 'results.trends.path'],
    exports: ['report.path', 'report.type', 'report.recipients']
  }
};

/**
 * Export context for a specific skill
 * @param {string} skillName - Name of the skill
 * @returns {Promise<Object>} Filtered context for the skill
 */
async function exportContext(skillName) {
  const context = await loadContext();
  const mapping = SKILL_CONTEXT_MAP[skillName];

  if (!mapping) {
    console.warn(`No context mapping for skill: ${skillName}`);
    return context;
  }

  const filtered = {
    runId: context.runId,
    startedAt: context.startedAt,
    lastSkill: context.lastSkill,
    updatedAt: context.updatedAt
  };

  // Import required keys
  for (const key of mapping.imports) {
    const value = getContextValue(context, `sdet.${key}`);
    if (value !== undefined) {
      setContextValue(filtered, `sdet.${key}`, value);
    }
  }

  return filtered;
}

/**
 * Import skill output into shared context
 * @param {string} skillName - Name of the skill
 * @param {Object} skillOutput - Output from the skill
 * @returns {Promise<Object>} Updated context
 */
async function importSkillOutput(skillName, skillOutput) {
  const mapping = SKILL_CONTEXT_MAP[skillName];

  if (!mapping) {
    console.warn(`No context mapping for skill: ${skillName}`);
    return;
  }

  // Save using state-helpers which handles namespacing
  return await saveContext(skillName, skillOutput);
}

/**
 * Validate context has required keys for a skill
 * @param {string} skillName - Skill name
 * @returns {Promise<Object>} Validation result
 */
async function validateSkillContext(skillName) {
  const context = await loadContext();
  return validateContextForSkill(context, skillName);
}

/**
 * Get context keys that a skill exports
 * @param {string} skillName - Skill name
 * @returns {string[]} Array of exported key paths
 */
function getExportedKeys(skillName) {
  const mapping = SKILL_CONTEXT_MAP[skillName];
  return mapping ? mapping.exports : [];
}

/**
 * Get context keys that a skill imports
 * @param {string} skillName - Skill name
 * @returns {string[]} Array of imported key paths
 */
function getImportedKeys(skillName) {
  const mapping = SKILL_CONTEXT_MAP[skillName];
  return mapping ? mapping.imports : [];
}

/**
 * List all skill context mappings
 * @returns {Object} All mappings
 */
function getAllMappings() {
  return SKILL_CONTEXT_MAP;
}

/**
 * Create context snapshot for debugging
 * @returns {Promise<Object>} Full context with metadata
 */
async function createSnapshot() {
  const context = await loadContext();
  return {
    ...context,
    _metadata: {
      snapshotAt: new Date().toISOString(),
      skillMappings: Object.keys(SKILL_CONTEXT_MAP).length,
      contextSize: JSON.stringify(context).length
    }
  };
}

/**
 * Restore context from snapshot
 * @param {Object} snapshot - Snapshot object
 */
async function restoreSnapshot(snapshot) {
  const { _metadata, ...context } = snapshot;
  const { saveContextRaw } = require('./state-helpers.js');
  await saveContextRaw(context);
}

module.exports = {
  exportContext,
  importSkillOutput,
  validateSkillContext,
  getExportedKeys,
  getImportedKeys,
  getAllMappings,
  createSnapshot,
  restoreSnapshot,
  SKILL_CONTEXT_MAP
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  (async () => {
    try {
      switch (command) {
        case 'export': {
          const skillName = args[0];
          const context = await exportContext(skillName);
          console.log(JSON.stringify(context, null, 2));
          break;
        }
        case 'import': {
          const skillName = args[0];
          const output = JSON.parse(args[1] || '{}');
          await importSkillOutput(skillName, output);
          console.log(`Imported output for ${skillName}`);
          break;
        }
        case 'validate': {
          const skillName = args[0];
          const result = await validateSkillContext(skillName);
          console.log(JSON.stringify(result, null, 2));
          process.exit(result.valid ? 0 : 1);
        }
        case 'keys': {
          const skillName = args[0];
          console.log('Imports:', getImportedKeys(skillName));
          console.log('Exports:', getExportedKeys(skillName));
          break;
        }
        case 'list': {
          console.log(JSON.stringify(getAllMappings(), null, 2));
          break;
        }
        case 'snapshot': {
          const snapshot = await createSnapshot();
          console.log(JSON.stringify(snapshot, null, 2));
          break;
        }
        default: {
          console.log('Usage: node context-helpers.js <command> [args]');
          console.log('Commands: export <skill>, import <skill> <json>, validate <skill>, keys <skill>, list, snapshot');
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}