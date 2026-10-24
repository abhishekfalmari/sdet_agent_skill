/**
 * k6 Load Test Template Generator
 * Generates k6 scripts for load, stress, soak, spike, and breakpoint testing
 */

const templates = {
  // Base load test
  'load-test.js': `import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Custom metrics
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests_total');

// Test configuration
export const options = {
  // Test type: load, stress, soak, spike, breakpoint
  // Configure via environment variables or CLI
  scenarios: {
    {{scenarioName}}: {
      executor: '{{executor}}',
      {{#if vus}}vus: {{vus}},{{/if}}
      {{#if duration}}duration: '{{duration}}',{{/if}}
      {{#if iterations}}iterations: {{iterations}},{{/if}}
      {{#if startVUs}}startVUs: {{startVUs}},{{/if}}
      {{#if maxVUs}}maxVUs: {{maxVUs}},{{/if}}
      {{#if stages}}
      stages: [
        {{#each stages}}
        { duration: '{{duration}}', target: {{target}} }{{#unless @last}},{{/unless}}
        {{/each}}
      ],
      {{/if}}
      gracefulRampDown: '30s',
      tags: { test_type: '{{testType}}' }
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<{{p95Threshold}}', 'p(99)<{{p99Threshold}}'],
    http_req_failed: ['rate<{{errorThreshold}}'],
    errors: ['rate<{{errorThreshold}}'],
    checks: ['rate>{{checkThreshold}}']
  },
  // Cloud execution
  {{#if cloud}}
  ext: {
    loadimpact: {
      projectID: {{projectId}},
      name: "{{testName}}"
    }
  },
  {{/if}}
  // Output
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'p(99.9)'],
  discardResponseBodies: true
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';
const TEST_USERS = JSON.parse(open('./test-data/users.json'));
let userIndex = 0;

function getNextUser() {
  const user = TEST_USERS[userIndex % TEST_USERS.length];
  userIndex++;
  return user;
}

// Default headers
function defaultHeaders(token?: string) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'k6-load-test/1.0'
  };
  if (token) {
    headers['Authorization'] = \`Bearer \${token}\`;
  }
  return headers;
}

// Setup - run once per VU
export function setup() {
  console.log('🔧 Test setup starting...');

  // Verify API is reachable
  const res = http.get(\`\${BASE_URL}/health\`, { headers: defaultHeaders() });
  check(res, { 'health check ok': (r) => r.status === 200 });

  // Authenticate and get tokens for all users
  const tokens = {};
  for (const user of TEST_USERS) {
    const loginRes = http.post(\`\${BASE_URL}/auth/login\`, JSON.stringify({
      email: user.email,
      password: user.password
    }), { headers: defaultHeaders() });

    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      tokens[user.email] = body.accessToken;
    }
  }

  console.log(\`✅ Setup complete. Authenticated \${Object.keys(tokens).length} users\`);
  return { tokens, baseUrl: BASE_URL };
}

// Teardown - run once after all VUs finish
export function teardown(data) {
  console.log('🧹 Test teardown...');
  // Cleanup if needed
}

// Main test function
export default function (data) {
  const user = getNextUser();
  const token = data.tokens[user.email];

  if (!token) {
    errorRate.add(1);
    console.error(\`No token for user: \${user.email}\`);
    return;
  }

  // Test scenarios
  {{#each scenarios}}
  group('{{name}}', () => {
    {{#each steps}}
    {{#if group}}
    group('{{name}}', () => {
      {{#each steps}}
      {{> step}}
      {{/each}}
    });
    {{else}}
    {{> step}}
    {{/if}}
    {{/each}}
  });
  {{/each}}

  // Think time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Step partial
{{#define "step"}}
{{#if request}}
const {{varName}}Res = http.{{method}}(\`\${BASE_URL}{{url}}\`, {{#if body}}JSON.stringify({{body}}){{else}}null{{/if}}, { headers: defaultHeaders(token) });
{{#if checks}}
check({{varName}}Res, {
  {{#each checks}}
  '{{name}}': (r) => {{condition}},
  {{/each}}
});
{{/if}}
errorRate.add({{varName}}Res.status >= 400);
responseTime.add({{varName}}Res.timings.duration);
requestCount.add(1);
{{/if}}
{{/define}}

// Handle summary for HTML report
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'test-results/k6-summary.json': JSON.stringify(data),
    'test-results/k6-report.html': htmlReport(data)
  };
}
`,

  // Stress test
  'stress-test.js': `import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },   // Warm up
        { duration: '5m', target: 50 },   // Normal load
        { duration: '2m', target: 100 },  // Stress
        { duration: '5m', target: 200 },  // Heavy stress
        { duration: '2m', target: 300 },  // Breaking point
        { duration: '5m', target: 300 },  // Sustained stress
        { duration: '2m', target: 0 }     // Cool down
      ],
      gracefulRampDown: '30s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1']
  }
};

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  const res = http.get(\`\${BASE_URL}/api/health\`, {
    headers: { 'Accept': 'application/json' }
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });

  errorRate.add(res.status >= 400);
  responseTime.add(res.timings.duration);

  sleep(1);
}
`,

  // Soak test
  'soak-test.js': `import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const memoryUsage = new Trend('memory_usage');
export const cpuUsage = new Trend('cpu_usage');
export const requestCount = new Counter('requests_total');

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: 50,
      duration: '4h', // Run for 4 hours
      gracefulRampDown: '30s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    // Alert if memory/CPU grows continuously
    'memory_usage': ['p(99)<500'], // MB
    'cpu_usage': ['p(99)<80'] // %
  }
};

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  const startTime = Date.now();

  const res = http.get(\`\${BASE_URL}/api/health\`, {
    headers: { 'Accept': 'application/json' }
  });

  const duration = Date.now() - startTime;

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000
  });

  errorRate.add(res.status >= 400);
  responseTime.add(res.timings.duration);
  requestCount.add(1);

  // Collect system metrics (requires k6 with system metrics enabled)
  // This is pseudo-code - actual implementation depends on k6 version
  // memoryUsage.add(getMemoryUsage());
  // cpuUsage.add(getCpuUsage());

  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'test-results/soak-summary.json': JSON.stringify(data),
    'test-results/soak-report.html': htmlReport(data)
  };
}
`,

  // Spike test
  'spike-test.js': `import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 10 },   // Baseline
        { duration: '10s', target: 500 }, // Sudden spike!
        { duration: '1m', target: 500 },  // Sustain spike
        { duration: '10s', target: 10 },  // Drop back
        { duration: '2m', target: 10 }    // Recovery observation
      ],
      gracefulRampDown: '10s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<10000'],
    http_req_failed: ['rate<0.2'], // Higher tolerance during spike
    errors: ['rate<0.2']
  }
};

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  const res = http.get(\`\${BASE_URL}/api/health\`, {
    headers: { 'Accept': 'application/json' }
  });

  check(res, {
    'status is 200': (r) => r.status === 200
  });

  errorRate.add(res.status >= 400);
  responseTime.add(res.timings.duration);

  sleep(0.5);
}
`,

  // Breakpoint test
  'breakpoint-test.js': `import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const throughput = new Trend('throughput');

export const options = {
  scenarios: {
    breakpoint: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '5m', target: 150 },
        { duration: '5m', target: 200 },
        { duration: '5m', target: 250 },
        { duration: '5m', target: 300 },
        { duration: '5m', target: 350 },
        { duration: '5m', target: 400 },
        { duration: '5m', target: 450 },
        { duration: '5m', target: 500 }
      ],
      gracefulRampDown: '30s'
    }
  },
  thresholds: {
    // No hard thresholds - we're finding the breaking point
    http_req_duration: ['p(99)<30000'],
    http_req_failed: ['rate<0.5']
  }
};

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  const res = http.get(\`\${BASE_URL}/api/health\`, {
    headers: { 'Accept': 'application/json' }
  });

  check(res, {
    'status is 200': (r) => r.status === 200
  });

  errorRate.add(res.status >= 400);
  responseTime.add(res.timings.duration);
  throughput.add(1);

  sleep(1);
}
`,

  // Test data generator
  'test-data/users.json.template': `[
  {{#each users}}
  {
    "email": "user{{@index}}@test.example.com",
    "password": "TestPass{{@index}}!",
    "firstName": "Test",
    "lastName": "User{{@index}}",
    "role": "{{role}}"
  }{{#unless @last}},{{/unless}}
  {{/each}}
]
`,

  // Parameterized test
  'parameterized-test.js': `import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load test data from CSV/JSON
const testData = new SharedArray('test data', function() {
  return JSON.parse(open('./test-data/api-endpoints.json'));
});

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};

const BASE_URL = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  // Each VU picks a different data item
  const data = testData[__VU - 1];

  if (!data) return;

  const res = http.request(data.method, \`\${BASE_URL}\${data.path}\`, data.body, {
    headers: {
      'Content-Type': 'application/json',
      ...data.headers
    }
  });

  check(res, {
    [\`\${data.name} - status \${data.expectedStatus}\`]: (r) => r.status === data.expectedStatus,
    [\`\${data.name} - response time\`]: (r) => r.timings.duration < data.maxDuration || 1000
  });

  sleep(data.thinkTime || 1);
}
`,

  // Test data for parameterized test
  'test-data/api-endpoints.json.template': `[
  {{#each endpoints}}
  {
    "name": "{{name}}",
    "method": "{{method}}",
    "path": "{{path}}",
    "body": {{#if body}}{{body}}{{else}}null{{/if}},
    "headers": {{#if headers}}{{headers}}{{else}}{}{{/if}},
    "expectedStatus": {{expectedStatus}},
    "maxDuration": {{maxDuration}},
    "thinkTime": {{thinkTime}}
  }{{#unless @last}},{{/unless}}
  {{/each}}
]
`
};

async function generateK6Templates(outputDir) {
  const fs = require('fs');
  const path = require('path');

  // Create test-data directory
  const dataDir = path.join(outputDir, 'test-data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const [fileName, content] of Object.entries(templates)) {
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, content);
    console.log(`Generated: ${filePath}`);
  }
}

if (require.main === module) {
  const outputDir = process.argv[2] || 'templates/automation/k6';
  generateK6Templates(outputDir).catch(console.error);
}

module.exports = { templates, generateK6Templates };