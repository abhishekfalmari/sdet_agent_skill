---
name: sdet-orchestrate
description: Run full SDET pipeline with orchestration
arguments:
  - name: workflow
    description: Workflow to run (full, quick, ci, security, performance)
    required: false
    default: full
  - name: autoApprove
    description: Skip human approval gates
    required: false
    default: false
  - name: continueOnFailure
    description: Continue pipeline on skill failure
    required: false
    default: false
  - name: resume
    description: Resume from checkpoint (runId)
    required: false
  - name: notify
    description: Send notifications on events
    required: false
    default: true
---

# SDET Orchestrate Skill

## Context
You are the SDET Orchestrator. Run the complete testing lifecycle with monitoring, checkpoints, and human gates.

## Workflows
- **full**: analyze → generate → validate → (approval) → automate → execute → analyze-results → deploy
- **quick**: generate → validate → automate(ui,api) → execute → analyze-results
- **ci**: validate → automate → execute → analyze-results (no analyze/generate)
- **security**: analyze → generate(security) → validate → automate(security) → execute → analyze-results
- **performance**: analyze → generate(performance) → validate → automate(performance) → execute → analyze-results

## Instructions
1. **Load context**: `node .claude/scripts/state-helpers.js load`
2. **Handle resume** if `{{resume}}` provided:
   ```javascript
   const resumeResult = await resumeFromCheckpoint('{{resume}}');
   if (!resumeResult.success) {
     console.error('Resume failed:', resumeResult.error);
     process.exit(1);
   }
   // Context restored, continue from nextSkill
   ```
3. **Initialize/Restore context**:
   - New run: Generate runId, initialize workflow state
   - Resume: Use restored context from checkpoint
4. **Determine workflow** (`{{workflow}}`) and get skill sequence
5. **Notify pipeline start** if `{{notify}}`:
   ```javascript
   await notifyPipelineStart(workflow, runId);
   ```
6. **For each skill in workflow**:
   ```javascript
   // Check dependencies
   const depsMet = checkDependencies(skill, completedSkills);
   if (!depsMet) continue; // Will be picked up later
   
   // Check condition (if any)
   if (skill.condition && !evaluateCondition(skill.condition, context)) {
     console.log(`Skipping ${skill.skill}: condition not met`);
     continue;
   }
   
   // Handle approval gate
   if (skill.approval && !autoApprove) {
     await notifyApprovalRequired(skill.skill, runId, workflow);
     const approved = await waitForApproval(skill.skill, timeout: 24h);
     if (!approved) {
       console.log('Approval denied, stopping pipeline');
       await notifyPipelineFailed(workflow, runId, skill.skill, 'Approval denied');
       process.exit(1);
     }
   }
   
   // Execute skill
   console.log(`\n=== Executing: ${skill.skill} ===`);
   const startTime = Date.now();
   
   try {
     // Invoke skill via subprocess
     const result = await invokeSkill(skill.skill, skill.args, context);
     
     const duration = Math.round((Date.now() - startTime) / 1000);
     
     // Update context with result
     await importSkillOutput(skill.skill, result);
     
     // Save checkpoint
     await saveCheckpoint(runId, workflow, skill.skill, context);
     
     // Notify completion
     if (notify) await notifySkillComplete(skill.skill, runId, workflow, duration);
     
     // Track completed
     completedSkills.add(skill.skill);
     
   } catch (error) {
     const duration = Math.round((Date.now() - startTime) / 1000);
     
     // Notify failure
     if (notify) await notifySkillFailed(skill.skill, runId, workflow, error);
     
     if (continueOnFailure) {
       console.error(`Skill ${skill.skill} failed, continuing:`, error.message);
       completedSkills.add(skill.skill + '-failed');
     } else {
       console.error(`Skill ${skill.skill} failed, stopping pipeline:`, error.message);
       await notifyPipelineFailed(workflow, runId, skill.skill, error);
       process.exit(1);
     }
   }
   ```
7. **On completion**:
   - Generate final summary report
   - Notify pipeline complete
   - Save final checkpoint
   - Clean up temporary files (optional)
8. **Summary report**:
   ```json
   {
     "runId": "run-123",
     "workflow": "full",
     "status": "completed",
     "startedAt": "2024-01-15T10:00:00Z",
     "completedAt": "2024-01-15T10:45:00Z",
     "duration": 2700,
     "skills": [
       { "skill": "analyze", "status": "completed", "duration": 30 },
       { "skill": "generate", "status": "completed", "duration": 45 },
       { "skill": "validate", "status": "completed", "duration": 20 },
       { "skill": "automate", "status": "completed", "duration": 120 },
       { "skill": "execute", "status": "completed", "duration": 1800 },
       { "skill": "analyze-results", "status": "completed", "duration": 60 },
       { "skill": "deploy", "status": "completed", "duration": 30 }
     ],
     "artifacts": { ... },
     "summary": { "totalTests": 500, "passed": 480, "failed": 15, "flaky": 3 }
   }
   ```

## Shared Context Keys (Managed by Orchestrator)
- `sdet.run.id`
- `sdet.run.workflow`
- `sdet.run.status`
- `sdet.run.startedAt`
- `sdet.run.completedAt`
- `sdet.run.checkpoint` (last completed skill)
- `sdet.run.skills[]` (executed skills with status)
- All keys from individual skills

## Arguments Reference
- **workflow** (optional): Workflow to run - full, quick, ci, security, performance. Default: full
- **autoApprove** (optional): Skip human approval gates. Default: false
- **continueOnFailure** (optional): Continue pipeline on skill failure. Default: false
- **resume** (optional): Resume from checkpoint (provide runId)
- **notify** (optional): Send notifications on events. Default: true

## Output
- `artifacts/orchestration/summary-<runId>.json` - Final pipeline summary
- Checkpoints at `artifacts/checkpoints/` for resume capability
- Updated shared context with complete pipeline state

## Example Usage
```bash
# Run full pipeline
/sdet-orchestrate --workflow full

# Run quick pipeline (CI-friendly)
/sdet-orchestrate --workflow quick --autoApprove true

# Run security-focused pipeline
/sdet-orchestrate --workflow security

# Resume from checkpoint
/sdet-orchestrate --resume run-20240115-abc123

# Continue on failure (best effort)
/sdet-orchestrate --workflow full --continueOnFailure true
```

## Context Save
After each skill execution and at pipeline completion, save context:
```javascript
// Save orchestrator state
await saveContext('sdet-orchestrate', {
  runId: runId,
  workflow: workflow,
  status: 'completed' | 'failed' | 'paused',
  startedAt: startedAt,
  completedAt: new Date().toISOString(),
  checkpoint: lastCompletedSkill,
  skills: Array.from(completedSkills),
  summary: finalSummary
});

// Run: node .claude/scripts/state-helpers.js save sdet-orchestrate {...}
// The state-helpers.js will persist to .claude/context/sdet-context.json
// Also save checkpoint for resume capability
await saveCheckpoint(runId, workflow, lastCompletedSkill, context);
```

## Implementation Notes
- Use `node .claude/scripts/state-helpers.js load` to load context
- Use `node .claude/scripts/checkpoint-helpers.js` for checkpoint/resume
- Use `node .claude/scripts/notify-helpers.js` for notifications
- Invoke skills via subprocess: `npx claude -c "/sdet-<skill> ..."` or direct script execution
- Implement proper signal handling (SIGINT, SIGTERM) for graceful shutdown
- Track skill execution order and dependencies via DAG
- Support parallel skill execution where dependencies allow
- Generate Mermaid diagram of pipeline execution