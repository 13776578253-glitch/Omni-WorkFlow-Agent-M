import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api';
const USER_ID = __ENV.USER_ID || '1001';
const SESSION_ID = __ENV.SESSION_ID || 'mock-1';

export default function () {
  const loginResponse = http.post(
    `${BASE_URL}/auth/login_2`,
    JSON.stringify({
      phone: '13800000000',
      password: '123456',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(loginResponse, {
    'login status is 200': (res) => res.status === 200,
    'login code is 0': (res) => res.json('code') === '0',
  });

  const historyResponse = http.get(`${BASE_URL}/history/sessions?id=${USER_ID}`);
  check(historyResponse, {
    'history status is 200': (res) => res.status === 200,
    'history code is 0': (res) => res.json('code') === '0',
  });

  const workflowGetResponse = http.get(`${BASE_URL}/workflow/sessions/${SESSION_ID}`);
  check(workflowGetResponse, {
    'workflow detail status is 200': (res) => res.status === 200,
    'workflow detail code is 0': (res) => res.json('code') === '0',
  });

  const workflowInputResponse = http.post(
    `${BASE_URL}/workflow/input`,
    JSON.stringify({
      sessionId: SESSION_ID,
      id: SESSION_ID,
      text: 'k6 smoke test input',
      blocks: [],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(workflowInputResponse, {
    'workflow input status is 200': (res) => res.status === 200,
    'workflow input code is 0': (res) => res.json('code') === '0',
  });

  sleep(1);
}
