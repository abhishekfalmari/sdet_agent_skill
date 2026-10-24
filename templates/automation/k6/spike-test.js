import http from 'k6/http';
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
  const res = http.get(`${BASE_URL}/api/health`, {
    headers: { 'Accept': 'application/json' }
  });

  check(res, {
    'status is 200': (r) => r.status === 200
  });

  errorRate.add(res.status >= 400);
  responseTime.add(res.timings.duration);

  sleep(0.5);
}
