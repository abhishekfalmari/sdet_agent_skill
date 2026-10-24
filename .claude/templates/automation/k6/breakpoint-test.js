import http from 'k6/http';
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
  const res = http.get(`${BASE_URL}/api/health`, {
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
