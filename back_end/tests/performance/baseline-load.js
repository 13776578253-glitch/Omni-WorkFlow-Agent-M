import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['avg<1200', 'p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api';
const USER_ID = __ENV.USER_ID || '1001';
const SESSION_ID = __ENV.SESSION_ID || 'mock-1';

export default function () {
  const endpoints = [
    () =>
      http.post(
        `${BASE_URL}/auth/login_2`,
        JSON.stringify({ phone: '13800000000', password: '123456' }),
        { headers: { 'Content-Type': 'application/json' } }
      ),
    () => http.get(`${BASE_URL}/history/sessions?id=${USER_ID}`),
    () =>
      http.post(
        `${BASE_URL}/workflow/input`,
        JSON.stringify({
          sessionId: SESSION_ID,
          id: SESSION_ID,
          text: 'baseline load input',
          blocks: [],
        }),
        { headers: { 'Content-Type': 'application/json' } }
      ),
    () => http.get(`${BASE_URL}/workflow/sessions/${SESSION_ID}`),
  ];

  const request = endpoints[__ITER % endpoints.length];
  const response = request();

  check(response, {
    'status is 200': (res) => res.status === 200,
    'code is 0': (res) => res.json('code') === '0',
  });

  sleep(1);
}
