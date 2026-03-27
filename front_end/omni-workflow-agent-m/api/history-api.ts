/**
 * History API
 * Base path: /api
 */

const API_BASE = 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
  details?: any;
}

export interface HistorySession {
  id: string;
  title: string;
  createdAt: number;
  isPinned: boolean;
  previewText?: string;
}

/**
 * Get user history sessions
 */
export async function getSessions(userId: string): Promise<HistorySession[]> {
  const response = await fetch(`${API_BASE}/history/sessions?id=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const text = await response.text();

  let result: ApiResponse<{ sessions: HistorySession[] }>;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to get sessions');
  }

  return result.data!.sessions;
}

/**
 * Create a new history session
 */
export async function createSession(
  userId: string,
  title: string,
  previewText?: string
): Promise<HistorySession> {
  const response = await fetch(`${API_BASE}/history/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, previewText }),
  });

  const text = await response.text();

  let result: ApiResponse<{ session: HistorySession }>;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to create session');
  }

  return result.data!.session;
}

/**
 * Delete a history session
 */
export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/history/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  const text = await response.text();

  let result: ApiResponse;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to delete session');
  }
}

/**
 * Rename a history session
 */
export async function renameSession(
  userId: string,
  sessionId: string,
  newTitle: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/history/sessions/${sessionId}/title`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newTitle }),
  });

  const text = await response.text();

  let result: ApiResponse;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to rename session');
  }
}

/**
 * Toggle pin status of a history session
 */
export async function togglePinSession(
  userId: string,
  sessionId: string,
  isPinned: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE}/history/sessions/${sessionId}/pin`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, isPinned }),
  });

  const text = await response.text();

  let result: ApiResponse;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to toggle pin');
  }
}
