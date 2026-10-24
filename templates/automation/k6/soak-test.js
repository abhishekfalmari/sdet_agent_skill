import http from 'k6/http';
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

  const res = http.get(`${BASE_URL}/api/health`, {
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
