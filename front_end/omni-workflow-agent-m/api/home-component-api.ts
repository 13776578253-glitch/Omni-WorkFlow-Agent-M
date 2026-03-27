/**
 * Home Portal API
 * Base path: /api
 */

const API_BASE = 'http://localhost:8000/api';

interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
  details?: any;
}

export interface PortalCountdownCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface PortalDayData {
  keys: string[];
  todoKeys?: string[];
  workflowKeys?: string[];
  detailBodyText?: string;
  countdownCards?: PortalCountdownCard[];
}

export interface PortalMonthData {
  [day: number]: PortalDayData;
}

/**
 * Get month calendar data
 */
export async function getMonthCalendar(
  userId: string,
  year: number,
  month: number
): Promise<PortalMonthData> {
  const response = await fetch(
    `${API_BASE}/portal/calendar?userId=${userId}&year=${year}&month=${month}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const text = await response.text();

  let result: ApiResponse<{ monthData: PortalMonthData }>;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to get calendar data');
  }

  return result.data!.monthData;
}

/**
 * Update day data
 */
export async function updateDayData(
  userId: string,
  year: number,
  month: number,
  day: number,
  dayData: PortalDayData
): Promise<void> {
  const response = await fetch(`${API_BASE}/portal/day`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, year, month, day, dayData }),
  });

  const text = await response.text();

  let result: ApiResponse;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to update day data');
  }
}

/**
 * Delete day data
 */
export async function deleteDayData(
  userId: string,
  year: number,
  month: number,
  day: number
): Promise<void> {
  const response = await fetch(`${API_BASE}/portal/day`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, year, month, day }),
  });

  const text = await response.text();

  let result: ApiResponse;
  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error(`服务器响应格式错误: ${text.substring(0, 100)}`);
  }

  if (result.code !== '0') {
    throw new Error(result.message || 'Failed to delete day data');
  }
}
