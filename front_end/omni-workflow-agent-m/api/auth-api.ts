/**
 * Authentication API
 * Base path: /api
 */

const API_BASE = 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
  details?: any;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
  };
}

interface SendCodeResponse {
  requestId: string; // This is actually the verification code in test environment
}

async function parseApiJson<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  let result: ApiResponse<T>;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

/**
 * Send verification code
 */
export async function sendCode(phone: string): Promise<SendCodeResponse> {
  const response = await fetch(`${API_BASE}/auth/code/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const result = await parseApiJson<SendCodeResponse>(response);
  return result.data!;
}

/**
 * Login with verification code
 */
export async function loginWithCode(phone: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login_1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const result = await parseApiJson<LoginResponse>(response);
  return result.data!;
}

/**
 * Login with password
 */
export async function loginWithPassword(phone: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login_2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });

  const result = await parseApiJson<LoginResponse>(response);
  return result.data!;
}

/**
 * Register new user
 * Field mapping: nickname -> name, code is ignored (not in API spec)
 */
export async function register(
  nickname: string,
  password: string,
  phone: string,
  code: string
): Promise<string> {
  void code;
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nickname,
      password,
      phone,
    }),
  });

  const result = await parseApiJson<string>(response);
  return result.data!;
}

/**
 * Reset password
 */
export async function resetPassword(
  phone: string,
  code: string,
  newPassword: string
): Promise<string> {
  void code;
  const response = await fetch(`${API_BASE}/auth/password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      newPassword,
    }),
  });

  const result = await parseApiJson<string>(response);
  return result.data!;
}

/**
 * Logout (optional endpoint)
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = await parseApiJson<{ success?: boolean }>(response);
  if (typeof result.data?.success === 'boolean' && !result.data.success) {
    throw new Error(result.message || 'Logout failed');
  }
}
