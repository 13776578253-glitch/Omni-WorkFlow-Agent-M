/**
 * Personal Preferences API
 * Base path: /api
 */

// TODO: Replace with your actual backend URL
const API_BASE = 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
  details?: any;
}

export interface UserPreferences {
  presetMode: 'custom' | 'concise' | 'formal';
  presetPrompts: {
    custom: string;
    concise: string;
    formal: string;
  };
  quickActionNames: {
    solt1: string;
    solt2: string;
    solt3: string;
    solt4: string;
  };
  quickActionPrompts: {
    solt1: string;
    solt2: string;
    solt3: string;
    solt4: string;
  };
  memoryContent: string;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const response = await fetch(`${API_BASE}/user/preferences?id=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const text = await response.text();

  let result: ApiResponse<UserPreferences>;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to get preferences');
  }

  return result.data!;
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
  const response = await fetch(`${API_BASE}/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: userId,
      ...preferences,
    }),
  });

  const text = await response.text();

  let result: ApiResponse;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to save preferences');
  }
}
