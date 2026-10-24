import http from 'k6/http';
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
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Setup - run once per VU
export function setup() {
  console.log('🔧 Test setup starting...');

  // Verify API is reachable
  const res = http.get(`${BASE_URL}/health`, { headers: defaultHeaders() });
  check(res, { 'health check ok': (r) => r.status === 200 });

  // Authenticate and get tokens for all users
  const tokens = {};
  for (const user of TEST_USERS) {
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password
    }), { headers: defaultHeaders() });

    if (loginRes.status === 200) {
      const body = JSON.parse(loginRes.body);
      tokens[user.email] = body.accessToken;
    }
  }

  console.log(`✅ Setup complete. Authenticated ${Object.keys(tokens).length} users`);
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
    console.error(`No token for user: ${user.email}`);
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
const {{varName}}Res = http.{{method}}(`${BASE_URL}{{url}}`, {{#if body}}JSON.stringify({{body}}){{else}}null{{/if}}, { headers: defaultHeaders(token) });
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
