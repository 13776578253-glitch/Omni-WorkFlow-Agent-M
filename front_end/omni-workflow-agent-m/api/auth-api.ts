/**
 * Authentication API
 * Base path: /api
 */

// TODO: Replace with your actual backend URL
const API_BASE = 'http://localhost:8000/api'; // Example: change to your backend address

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

/**
 * Send verification code
 */
export async function sendCode(phone: string): Promise<SendCodeResponse> {
  const response = await fetch(`${API_BASE}/auth/code/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  const text = await response.text();

  let result: ApiResponse<SendCodeResponse>;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to send code');
  }

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

  const result: ApiResponse<LoginResponse> = await response.json();

  if (result.code !== '0') {
    throw new Error(result.message || 'Login failed');
  }

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

  const result: ApiResponse<LoginResponse> = await response.json();

  if (result.code !== '0') {
    throw new Error(result.message || 'Login failed');
  }

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
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nickname, // Map nickname to name
      password,
      phone
      // code is ignored - not in API spec
    }),
  });

  const result: ApiResponse<string> = await response.json();

  if (result.code !== '0') {
    throw new Error(result.message || 'Registration failed');
  }

  return result.data!; // Returns user id
}

/**
 * Reset password
 * Note: code parameter is ignored (not in API spec)
 */
export async function resetPassword(
  phone: string,
  code: string,
  newPassword: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      newPassword
      // code is ignored - not in API spec
    }),
  });

  const result: ApiResponse<string> = await response.json();

  if (result.code !== '0') {
    throw new Error(result.message || 'Password reset failed');
  }

  return result.data!; // Returns user id
}

/**
 * Logout (optional endpoint)
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const result: ApiResponse<{ success: boolean }> = await response.json();

  if (!result.data?.success) {
    throw new Error('Logout failed');
  }
}
