import http from 'k6/http';
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
  const res = http.get(`${BASE_URL}/api/health`, {
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
