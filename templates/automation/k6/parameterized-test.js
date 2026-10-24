import http from 'k6/http';
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

  const res = http.request(data.method, `${BASE_URL}${data.path}`, data.body, {
    headers: {
      'Content-Type': 'application/json',
      ...data.headers
    }
  });

  check(res, {
    [`${data.name} - status ${data.expectedStatus}`]: (r) => r.status === data.expectedStatus,
    [`${data.name} - response time`]: (r) => r.timings.duration < data.maxDuration || 1000
  });

  sleep(data.thinkTime || 1);
}
