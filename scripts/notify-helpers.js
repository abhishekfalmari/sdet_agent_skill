/**
 * SDET Skills - Notification Helpers
 * Multi-channel notifications (Slack, Teams, Email, Webhooks)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

const TEMPLATE_DIR = path.join(__dirname, '../templates/notifications');

// Default templates
const DEFAULT_TEMPLATES = {
  slack: {
    pipelineStart: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '🚀 SDET Pipeline Started' }},
        { type: 'section', fields: [
          { type: 'mrkdwn', text: '*Workflow:*\n{{workflow}}' },
          { type: 'mrkdwn', text: '*Run ID:*\n{{runId}}' },
          { type: 'mrkdwn', text: '*Repository:*\n{{repo}}' },
          { type: 'mrkdwn', text: '*Branch:*\n{{branch}}' },
          { type: 'mrkdwn', text: '*Trigger:*\n{{trigger}}' },
          { type: 'mrkdwn', text: '*Started:*\n{{startedAt}}' }
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: '<{{runUrl}}|View Pipeline>' }}
      ]
    },
    skillComplete: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '✅ Skill Completed' }},
        { type: 'section', fields: [
          { type: 'mrkdwn', text: '*Skill:*\n{{skill}}' },
          { type: 'mrkdwn', text: '*Workflow:*\n{{workflow}}' },
          { type: 'mrkdwn', text: '*Run ID:*\n{{runId}}' },
          { type: 'mrkdwn', text: '*Duration:*\n{{duration}}s' }
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: '<{{runUrl}}|View Details>' }}
      ]
    },
    skillFailed: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '❌ Skill Failed' }},
        { type: 'section', fields: [
          { type: 'mrkdwn', text: '*Skill:*\n{{skill}}' },
          { type: 'mrkdwn', text: '*Workflow:*\n{{workflow}}' },
          { type: 'mrkdwn', text: '*Run ID:*\n{{runId}}' },
          { type: 'mrkdwn', text: '*Duration:*\n{{duration}}s' }
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: '*Error:*\n```{{error}}```' }},
        { type: 'section', text: { type: 'mrkdwn', text: '<{{runUrl}}|View Details>' }}
      ]
    },
    pipelineComplete: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '🎉 Pipeline Completed' }},
        { type: 'section', fields: [
          { type: 'mrkdwn', text: '*Workflow:*\n{{workflow}}' },
          { type: 'mrkdwn', text: '*Run ID:*\n{{runId}}' },
          { type: 'mrkdwn', text: '*Status:*\n{{status}}' },
          { type: 'mrkdwn', text: '*Duration:*\n{{duration}}s' },
          { type: 'mrkdwn', text: '*Total Tests:*\n{{totalTests}}' },
          { type: 'mrkdwn', text: '*Passed:*\n{{passed}}' },
          { type: 'mrkdwn', text: '*Failed:*\n{{failed}}' },
          { type: 'mrkdwn', text: '*Flaky:*\n{{flaky}}' }
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: '<{{runUrl}}|View Full Report>' }}
      ]
    },
    pipelineFailed: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '💥 Pipeline Failed' }},
        { type: 'section', fields: [
          { type: 'mrkdwn', text: '*Workflow:*\n{{workflow}}' },
          { type: 'mrkdwn', text: '*Run ID:*\n{{runId}}' },
          { type: 'mrkdwn', text: '*Failed Skill:*\n{{failedSkill}}' },
          { type: 'mrkdwn', text: '*Duration:*\n{{duration}}s' }
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: '*Error:*\n```{{error}}```' }},
        { type: 'section', text: { type: 'mrkdwn', text: '<{{runUrl}}|View Details>' }}
      ]
    },
    approvalRequired: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '⏸️ Approval Required' }},
        { type: 'section', fields: [
          { type: 'mrkdwn', text: '*Skill:*\n{{skill}}' },
          { type: 'mrkdwn', text: '*Workflow:*\n{{workflow}}' },
          { type: 'mrkdwn', text: '*Run ID:*\n{{runId}}' },
          { type: 'mrkdwn', text: '*Timeout:*\n24 hours' }
        ]},
        { type: 'section', text: { type: 'mrkdwn', text: 'Please review validation results and approve to continue.' }},
        { type: 'section', text: { type: 'mrkdwn', text: '<{{runUrl}}|View Pipeline>' }}
      ]
    }
  },
  teams: {
    pipelineStart: {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: '0078D4',
      summary: 'SDET Pipeline Started',
      sections: [{
        activityTitle: '🚀 SDET Pipeline Started',
        facts: [
          { name: 'Workflow', value: '{{workflow}}' },
          { name: 'Run ID', value: '{{runId}}' },
          { name: 'Repository', value: '{{repo}}' },
          { name: 'Branch', value: '{{branch}}' },
          { name: 'Trigger', value: '{{trigger}}' },
          { name: 'Started', value: '{{startedAt}}' }
        ],
        markdown: true
      }],
      potentialAction: [{
        '@type': 'OpenUri',
        name: 'View Pipeline',
        targets: [{ os: 'default', uri: '{{runUrl}}' }]
      }]
    }
  },
  email: {
    pipelineStart: {
      subject: '🚀 SDET Pipeline Started - {{workflow}}',
      html: `
        <h2>SDET Pipeline Started</h2>
        <table>
          <tr><td><strong>Workflow:</strong></td><td>{{workflow}}</td></tr>
          <tr><td><strong>Run ID:</strong></td><td>{{runId}}</td></tr>
          <tr><td><strong>Repository:</strong></td><td>{{repo}}</td></tr>
          <tr><td><strong>Branch:</strong></td><td>{{branch}}</td></tr>
          <tr><td><strong>Trigger:</strong></td><td>{{trigger}}</td></tr>
          <tr><td><strong>Started:</strong></td><td>{{startedAt}}</td></tr>
        </table>
        <p><a href="{{runUrl}}">View Pipeline</a></p>
      `
    }
  }
};

/**
 * Send HTTP request
 */
function sendRequest(url, options, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SDET-Skills/1.0',
        ...options.headers
      }
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Render template with data
 */
function renderTemplate(template, data) {
  const compiled = handlebars.compile(JSON.stringify(template));
  return JSON.parse(compiled(JSON.stringify(data)));
}

/**
 * Send Slack notification
 */
async function sendSlack(webhookUrl, templateName, data) {
  const template = DEFAULT_TEMPLATES.slack[templateName];
  if (!template) throw new Error(`Unknown Slack template: ${templateName}`);

  const payload = renderTemplate(template, data);
  return sendRequest(webhookUrl, { method: 'POST' }, payload);
}

/**
 * Send Teams notification
 */
async function sendTeams(webhookUrl, templateName, data) {
  const template = DEFAULT_TEMPLATES.teams[templateName];
  if (!template) throw new Error(`Unknown Teams template: ${templateName}`);

  const payload = renderTemplate(template, data);
  return sendRequest(webhookUrl, { method: 'POST' }, payload);
}

/**
 * Send Email notification (via webhook)
 */
async function sendEmail(webhookUrl, templateName, data) {
  const template = DEFAULT_TEMPLATES.email[templateName];
  if (!template) throw new Error(`Unknown Email template: ${templateName}`);

  const payload = {
    subject: renderTemplate(template.subject, data),
    html: renderTemplate(template.html, data),
    ...data.emailOptions
  };

  return sendRequest(webhookUrl, { method: 'POST' }, payload);
}

/**
 * Send generic webhook
 */
async function sendWebhook(webhookUrl, data) {
  return sendRequest(webhookUrl, { method: 'POST' }, data);
}

/**
 * Notify pipeline start
 */
async function notifyPipelineStart(workflow, runId, context = {}) {
  const data = {
    workflow,
    runId,
    repo: context.repo || process.env.GITHUB_REPOSITORY || 'unknown',
    branch: context.branch || process.env.GITHUB_REF_NAME || 'unknown',
    trigger: context.trigger || process.env.GITHUB_EVENT_NAME || 'manual',
    startedAt: new Date().toISOString(),
    runUrl: context.runUrl || `https://github.com/${context.repo}/actions/runs/${context.runId}`
  };

  const results = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    try { await sendSlack(process.env.SLACK_WEBHOOK_URL, 'pipelineStart', data); results.push('slack'); }
    catch (e) { console.error('Slack notification failed:', e.message); }
  }

  if (process.env.TEAMS_WEBHOOK_URL) {
    try { await sendTeams(process.env.TEAMS_WEBHOOK_URL, 'pipelineStart', data); results.push('teams'); }
    catch (e) { console.error('Teams notification failed:', e.message); }
  }

  if (process.env.EMAIL_WEBHOOK_URL) {
    try { await sendEmail(process.env.EMAIL_WEBHOOK_URL, 'pipelineStart', data); results.push('email'); }
    catch (e) { console.error('Email notification failed:', e.message); }
  }

  if (process.env.WEBHOOK_URL) {
    try { await sendWebhook(process.env.WEBHOOK_URL, { event: 'pipelineStart', ...data }); results.push('webhook'); }
    catch (e) { console.error('Webhook notification failed:', e.message); }
  }

  return { sent: results };
}

/**
 * Notify skill complete
 */
async function notifySkillComplete(skill, runId, workflow, duration, context = {}) {
  const data = {
    skill,
    workflow,
    runId,
    duration,
    runUrl: context.runUrl || `https://github.com/${context.repo}/actions/runs/${context.runId}`
  };

  const results = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    try { await sendSlack(process.env.SLACK_WEBHOOK_URL, 'skillComplete', data); results.push('slack'); }
    catch (e) { console.error('Slack notification failed:', e.message); }
  }

  return { sent: results };
}

/**
 * Notify skill failed
 */
async function notifySkillFailed(skill, runId, workflow, error, context = {}) {
  const data = {
    skill,
    workflow,
    runId,
    duration: context.duration || 0,
    error: error.message || String(error),
    runUrl: context.runUrl || `https://github.com/${context.repo}/actions/runs/${context.runId}`
  };

  const results = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    try { await sendSlack(process.env.SLACK_WEBHOOK_URL, 'skillFailed', data); results.push('slack'); }
    catch (e) { console.error('Slack notification failed:', e.message); }
  }

  if (process.env.TEAMS_WEBHOOK_URL) {
    try { await sendTeams(process.env.TEAMS_WEBHOOK_URL, 'skillFailed', data); results.push('teams'); }
    catch (e) { console.error('Teams notification failed:', e.message); }
  }

  return { sent: results };
}

/**
 * Notify pipeline complete
 */
async function notifyPipelineComplete(workflow, runId, summary, context = {}) {
  const data = {
    workflow,
    runId,
    status: summary.status || 'completed',
    duration: summary.duration || 0,
    totalTests: summary.totalTests || 0,
    passed: summary.passed || 0,
    failed: summary.failed || 0,
    flaky: summary.flaky || 0,
    runUrl: context.runUrl || `https://github.com/${context.repo}/actions/runs/${context.runId}`
  };

  const results = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    try { await sendSlack(process.env.SLACK_WEBHOOK_URL, 'pipelineComplete', data); results.push('slack'); }
    catch (e) { console.error('Slack notification failed:', e.message); }
  }

  return { sent: results };
}

/**
 * Notify pipeline failed
 */
async function notifyPipelineFailed(workflow, runId, failedSkill, error, context = {}) {
  const data = {
    workflow,
    runId,
    failedSkill,
    duration: context.duration || 0,
    error: error.message || String(error),
    runUrl: context.runUrl || `https://github.com/${context.repo}/actions/runs/${context.runId}`
  };

  const results = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    try { await sendSlack(process.env.SLACK_WEBHOOK_URL, 'pipelineFailed', data); results.push('slack'); }
    catch (e) { console.error('Slack notification failed:', e.message); }
  }

  if (process.env.TEAMS_WEBHOOK_URL) {
    try { await sendTeams(process.env.TEAMS_WEBHOOK_URL, 'pipelineFailed', data); results.push('teams'); }
    catch (e) { console.error('Teams notification failed:', e.message); }
  }

  return { sent: results };
}

/**
 * Notify approval required
 */
async function notifyApprovalRequired(skill, runId, workflow, context = {}) {
  const data = {
    skill,
    workflow,
    runId,
    runUrl: context.runUrl || `https://github.com/${context.repo}/actions/runs/${context.runId}`
  };

  const results = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    try { await sendSlack(process.env.SLACK_WEBHOOK_URL, 'approvalRequired', data); results.push('slack'); }
    catch (e) { console.error('Slack notification failed:', e.message); }
  }

  return { sent: results };
}

/**
 * Load custom templates from file system
 */
async function loadCustomTemplates() {
  const templates = { ...DEFAULT_TEMPLATES };

  try {
    const channels = await fs.readdir(TEMPLATE_DIR);

    for (const channel of channels) {
      const channelPath = path.join(TEMPLATE_DIR, channel);
      const files = await fs.readdir(channelPath);

      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.hbs')) {
          const templateName = file.replace(/\.(json|hbs)$/, '');
          const content = await fs.readFile(path.join(channelPath, file), 'utf-8');

          if (!templates[channel]) templates[channel] = {};
          templates[channel][templateName] = file.endsWith('.json') ? JSON.parse(content) : content;
        }
      }
    }
  } catch (error) {
    // Custom templates directory might not exist
  }

  return templates;
}

module.exports = {
  sendSlack,
  sendTeams,
  sendEmail,
  sendWebhook,
  notifyPipelineStart,
  notifySkillComplete,
  notifySkillFailed,
  notifyPipelineComplete,
  notifyPipelineFailed,
  notifyApprovalRequired,
  loadCustomTemplates,
  renderTemplate,
  DEFAULT_TEMPLATES
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  (async () => {
    try {
      switch (command) {
        case 'pipeline-start': {
          const result = await notifyPipelineStart(args[0], args[1], JSON.parse(args[2] || '{}'));
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'skill-complete': {
          const result = await notifySkillComplete(args[0], args[1], args[2], parseInt(args[3]), JSON.parse(args[4] || '{}'));
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'skill-failed': {
          const result = await notifySkillFailed(args[0], args[1], args[2], new Error(args[3]), JSON.parse(args[4] || '{}'));
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'pipeline-complete': {
          const result = await notifyPipelineComplete(args[0], args[1], JSON.parse(args[2]), JSON.parse(args[3] || '{}'));
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'pipeline-failed': {
          const result = await notifyPipelineFailed(args[0], args[1], args[2], new Error(args[3]), JSON.parse(args[4] || '{}'));
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        case 'approval': {
          const result = await notifyApprovalRequired(args[0], args[1], args[2], JSON.parse(args[3] || '{}'));
          console.log(JSON.stringify(result, null, 2));
          break;
        }
        default: {
          console.log('Usage: node notify-helpers.js <command> [args]');
          console.log('Commands: pipeline-start <workflow> <runId> [context], skill-complete <skill> <runId> <workflow> <duration> [context], skill-failed <skill> <runId> <workflow> <error> [context], pipeline-complete <workflow> <runId> <summary> [context], pipeline-failed <workflow> <runId> <failedSkill> <error> [context], approval <skill> <runId> <workflow> [context]');
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}