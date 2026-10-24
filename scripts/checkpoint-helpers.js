/**
 * SDET Skills - Checkpoint & Resume Helpers
 * Workflow checkpoint/resume with DAG dependency resolution
 */

const fs = require('fs').promises;
const path = require('path');
const { loadContext, saveContextRaw, getContextValue } = require('./state-helpers.js');

const CHECKPOINT_DIR = 'artifacts/checkpoints';

/**
 * Workflow definitions with DAG
 */
const WORKFLOWS = {
  full: {
    name: 'Full Pipeline',
    stages: [
      { id: 'analyze', skills: ['analyze'], dependsOn: [] },
      { id: 'generate', skills: ['generate'], dependsOn: ['analyze'] },
      { id: 'validate', skills: ['validate'], dependsOn: ['generate'], approvalGate: true },
      { id: 'automate', skills: ['automate'], dependsOn: ['validate'], parallel: true },
      { id: 'execute', skills: ['execute'], dependsOn: ['automate'] },
      { id: 'analyze-results', skills: ['analyze-results'], dependsOn: ['execute'] },
      { id: 'deploy', skills: ['deploy'], dependsOn: ['analyze-results'] }
    ]
  },
  quick: {
    name: 'Quick Pipeline',
    stages: [
      { id: 'generate', skills: ['generate'], dependsOn: [] },
      { id: 'validate', skills: ['validate'], dependsOn: ['generate'] },
      { id: 'automate', skills: ['automate'], dependsOn: ['validate'], parallel: true, filter: ['ui', 'api'] },
      { id: 'execute', skills: ['execute'], dependsOn: ['automate'] },
      { id: 'analyze-results', skills: ['analyze-results'], dependsOn: ['execute'] }
    ]
  },
  ci: {
    name: 'CI Pipeline',
    stages: [
      { id: 'validate', skills: ['validate'], dependsOn: [] },
      { id: 'automate', skills: ['automate'], dependsOn: ['validate'], parallel: true },
      { id: 'execute', skills: ['execute'], dependsOn: ['automate'] },
      { id: 'analyze-results', skills: ['analyze-results'], dependsOn: ['execute'] }
    ]
  },
  security: {
    name: 'Security Pipeline',
    stages: [
      { id: 'analyze', skills: ['analyze'], dependsOn: [] },
      { id: 'generate', skills: ['generate'], dependsOn: ['analyze'], args: { template: 'security' } },
      { id: 'validate', skills: ['validate'], dependsOn: ['generate'] },
      { id: 'automate', skills: ['automate'], dependsOn: ['validate'], args: { type: 'security' } },
      { id: 'execute', skills: ['execute'], dependsOn: ['automate'], args: { type: 'security' } },
      { id: 'analyze-results', skills: ['analyze-results'], dependsOn: ['execute'] }
    ]
  },
  performance: {
    name: 'Performance Pipeline',
    stages: [
      { id: 'analyze', skills: ['analyze'], dependsOn: [] },
      { id: 'generate', skills: ['generate'], dependsOn: ['analyze'], args: { template: 'performance' } },
      { id: 'validate', skills: ['validate'], dependsOn: ['generate'] },
      { id: 'automate', skills: ['automate'], dependsOn: ['validate'], args: { type: 'performance' } },
      { id: 'execute', skills: ['execute'], dependsOn: ['automate'], args: { type: 'performance' } },
      { id: 'analyze-results', skills: ['analyze-results'], dependsOn: ['execute'] }
    ]
  }
};

/**
 * Ensure checkpoint directory exists
 */
async function ensureCheckpointDir(runId) {
  await fs.mkdir(path.join(CHECKPOINT_DIR, runId), { recursive: true });
}

/**
 * Save checkpoint for a skill
 * @param {string} runId - Run ID
 * @param {string} workflow - Workflow name
 * @param {string} skillName - Skill that completed
 * @param {Object} context - Current context
 */
async function saveCheckpoint(runId, workflow, skillName, context) {
  await ensureCheckpointDir(runId);

  const checkpoint = {
    runId,
    workflow,
    completedSkill: skillName,
    timestamp: new Date().toISOString(),
    context: {
      runId: context.runId,
      startedAt: context.startedAt,
      lastSkill: context.lastSkill,
      sdet: context.sdet
    }
  };

  const fileName = `checkpoint-${skillName}.json`;
  const filePath = path.join(CHECKPOINT_DIR, runId, fileName);

  await fs.writeFile(filePath, JSON.stringify(checkpoint, null, 2));

  // Also save latest checkpoint reference
  await fs.writeFile(
    path.join(CHECKPOINT_DIR, runId, 'latest.json'),
    JSON.stringify({ ...checkpoint, file: fileName }, null, 2)
  );

  return checkpoint;
}

/**
 * Load latest checkpoint for a run
 * @param {string} runId - Run ID
 * @returns {Promise<Object|null>} Checkpoint or null if not found
 */
async function loadLatestCheckpoint(runId) {
  const latestPath = path.join(CHECKPOINT_DIR, runId, 'latest.json');

  try {
    const content = await fs.readFile(latestPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Load specific checkpoint
 * @param {string} runId - Run ID
 * @param {string} skillName - Skill name
 * @returns {Promise<Object|null>} Checkpoint or null
 */
async function loadCheckpoint(runId, skillName) {
  const filePath = path.join(CHECKPOINT_DIR, runId, `checkpoint-${skillName}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Resume from checkpoint
 * @param {string} runId - Run ID to resume from
 * @returns {Promise<Object>} Resume result with restored context and next skill
 */
async function resumeFromCheckpoint(runId) {
  const checkpoint = await loadLatestCheckpoint(runId);

  if (!checkpoint) {
    return { success: false, error: `No checkpoint found for run: ${runId}` };
  }

  // Restore context
  const restoredContext = checkpoint.context;
  restoredContext.resumedAt = new Date().toISOString();
  restoredContext.resumedFrom = runId;
  restoredContext.sdet.run.status = 'running';
  restoredContext.sdet.run.checkpoint = checkpoint.completedSkill;

  await saveContextRaw(restoredContext);

  // Determine next skill
  const workflow = WORKFLOWS[checkpoint.workflow];
  if (!workflow) {
    return { success: false, error: `Unknown workflow: ${checkpoint.workflow}` };
  }

  const completedSkills = new Set(
    restoredContext.sdet.run.skills
      .filter(s => s.status === 'completed')
      .map(s => s.skill)
  );
  completedSkills.add(checkpoint.completedSkill);

  const nextStage = findNextExecutableStage(workflow, completedSkills);

  return {
    success: true,
    runId,
    workflow: checkpoint.workflow,
    restoredContext,
    completedSkill: checkpoint.completedSkill,
    nextStage: nextStage ? nextStage.id : null,
    nextSkills: nextStage ? nextStage.skills : [],
    completedSkills: Array.from(completedSkills)
  };
}

/**
 * Find next executable stage in workflow
 * @param {Object} workflow - Workflow definition
 * @param {Set<string>} completedSkills - Set of completed skill names
 * @returns {Object|null} Next stage or null if complete
 */
function findNextExecutableStage(workflow, completedSkills) {
  for (const stage of workflow.stages) {
    const stageSkillsCompleted = stage.skills.every(s => completedSkills.has(s));
    if (stageSkillsCompleted) continue;

    const depsMet = stage.dependsOn.every(dep =>
      workflow.stages.find(s => s.id === dep)?.skills.every(s => completedSkills.has(s))
    );

    if (depsMet) {
      return stage;
    }
  }
  return null;
}

/**
 * Get workflow execution plan
 * @param {string} workflowName - Workflow name
 * @returns {Object} Execution plan with stages and dependencies
 */
function getWorkflowPlan(workflowName) {
  const workflow = WORKFLOWS[workflowName];
  if (!workflow) {
    throw new Error(`Unknown workflow: ${workflowName}`);
  }

  return {
    name: workflow.name,
    workflow: workflowName,
    stages: workflow.stages.map(stage => ({
      id: stage.id,
      skills: stage.skills,
      dependsOn: stage.dependsOn,
      parallel: stage.parallel || false,
      approvalGate: stage.approvalGate || false,
      args: stage.args || {}
    }))
  };
}

/**
 * Validate workflow DAG (no cycles)
 * @param {string} workflowName - Workflow name
 * @returns {Object} Validation result
 */
function validateWorkflowDAG(workflowName) {
  const workflow = WORKFLOWS[workflowName];
  if (!workflow) {
    return { valid: false, error: `Unknown workflow: ${workflowName}` };
  }

  const visited = new Set();
  const recursionStack = new Set();

  function hasCycle(stageId) {
    visited.add(stageId);
    recursionStack.add(stageId);

    const stage = workflow.stages.find(s => s.id === stageId);
    if (stage) {
      for (const dep of stage.dependsOn) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }
    }

    recursionStack.delete(stageId);
    return false;
  }

  for (const stage of workflow.stages) {
    if (!visited.has(stage.id)) {
      if (hasCycle(stage.id)) {
        return { valid: false, error: `Cycle detected in workflow: ${workflowName}` };
      }
    }
  }

  return { valid: true };
}

/**
 * List all checkpoints for a run
 * @param {string} runId - Run ID
 * @returns {Promise<Array>} Array of checkpoint info
 */
async function listCheckpoints(runId) {
  const dirPath = path.join(CHECKPOINT_DIR, runId);

  try {
    const files = await fs.readdir(dirPath);
    const checkpoints = [];

    for (const file of files) {
      if (file.startsWith('checkpoint-') && file.endsWith('.json')) {
        const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
        const checkpoint = JSON.parse(content);
        checkpoints.push({
          skill: checkpoint.completedSkill,
          timestamp: checkpoint.timestamp,
          file
        });
      }
    }

    return checkpoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Clean old checkpoints (keep last N)
 * @param {number} keep - Number of checkpoints to keep
 */
async function cleanOldCheckpoints(keep = 10) {
  try {
    const runs = await fs.readdir(CHECKPOINT_DIR);

    for (const run of runs) {
      const checkpoints = await listCheckpoints(run);
      if (checkpoints.length > keep) {
        const toDelete = checkpoints.slice(0, checkpoints.length - keep);
        for (const cp of toDelete) {
          await fs.unlink(path.join(CHECKPOINT_DIR, run, cp.file));
        }
      }
    }
  } catch (error) {
    // Directory might not exist
  }
}

/**
 * Generate Mermaid diagram of workflow
 * @param {string} workflowName - Workflow name
 * @returns {string} Mermaid diagram
 */
function generateWorkflowDiagram(workflowName) {
  const workflow = WORKFLOWS[workflowName];
  if (!workflow) return '';

  let diagram = 'graph TD\n';

  for (const stage of workflow.stages) {
    const nodeId = stage.id;
    const label = stage.skills.join(', ');
    diagram += `  ${nodeId}["${label}"]\n`;

    for (const dep of stage.dependsOn) {
      diagram += `  ${dep} --> ${nodeId}\n`;
    }

    if (stage.approvalGate) {
      diagram += `  ${nodeId}:::approval\n`;
    }
    if (stage.parallel) {
      diagram += `  ${nodeId}:::parallel\n`;
    }
  }

  diagram += '\n  classDef approval fill:#fff3e0,stroke:#f57c00;\n';
  diagram += '  classDef parallel fill:#e8f5e9,stroke:#2e7d32;\n';

  return diagram;
}

module.exports = {
  saveCheckpoint,
  loadLatestCheckpoint,
  loadCheckpoint,
  resumeFromCheckpoint,
  findNextExecutableStage,
  getWorkflowPlan,
  validateWorkflowDAG,
  listCheckpoints,
  cleanOldCheckpoints,
  generateWorkflowDiagram,
  WORKFLOWS,
  CHECKPOINT_DIR
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  (async () => {
    try {
      switch (command) {
        case 'save': {
          const [runId, workflow, skillName] = args;
          const context = await loadContext();
          await saveCheckpoint(runId, workflow, skillName, context);
          console.log(`Saved checkpoint for ${skillName}`);
          break;
        }
        case 'load': {
          const runId = args[0];
          const checkpoint = await loadLatestCheckpoint(runId);
          console.log(JSON.stringify(checkpoint, null, 2));
          break;
        }
        case 'resume': {
          const runId = args[0];
          const result = await resumeFromCheckpoint(runId);
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'plan': {
          const workflowName = args[0] || 'full';
          console.log(JSON.stringify(getWorkflowPlan(workflowName), null, 2));
          break;
        }
        case 'validate': {
          const workflowName = args[0] || 'full';
          console.log(JSON.stringify(validateWorkflowDAG(workflowName), null, 2));
          break;
        }
        case 'list': {
          const runId = args[0];
          console.log(JSON.stringify(await listCheckpoints(runId), null, 2));
          break;
        }
        case 'diagram': {
          const workflowName = args[0] || 'full';
          console.log(generateWorkflowDiagram(workflowName));
          break;
        }
        case 'clean': {
          const keep = parseInt(args[0]) || 10;
          await cleanOldCheckpoints(keep);
          console.log(`Cleaned checkpoints, keeping last ${keep}`);
          break;
        }
        default: {
          console.log('Usage: node checkpoint-helpers.js <command> [args]');
          console.log('Commands: save <runId> <workflow> <skill>, load <runId>, resume <runId>, plan [workflow], validate [workflow], list <runId>, diagram [workflow], clean [keep]');
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}