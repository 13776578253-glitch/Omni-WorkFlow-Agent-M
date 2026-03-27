import AsyncStorage from '@react-native-async-storage/async-storage';
import * as portalApi from '@/api/home-component-api';

const STORAGE_KEY = '@omni_portal_calendar_v1';
const AUTH_STORAGE_KEY = '@omni_workflow_user_auth_v1';

export type PortalCountdownCard = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
};

export type PortalDayData = {
  keys: string[];
  todoKeys?: string[];
  workflowKeys?: string[];
  detailBodyText?: string;
  countdownCards?: PortalCountdownCard[];
};

export type PortalMonthData = {
  [day: number]: PortalDayData;
};

export type PortalCalendarData = {
  [month: number]: PortalMonthData;
};

const PORTAL_CALENDAR_DATA: PortalCalendarData = {
  3: {
    16: {
      keys: ['summary-0316'],
      workflowKeys: ['workflow-0316-a'],
      detailBodyText: '3月16日：已归档 1 条历史工作流记录，请按计划推进。',
      countdownCards: [
        { id: 'card_0316_1', title: '流程复盘提醒', subtitle: '测试内容：检查上周工作流节点完成情况', badge: '2天' },
      ],
    },
    18: {
      keys: ['summary-0318'],
      todoKeys: ['todo-0318-a'],
      detailBodyText: '3月18日：今日待办较多，建议优先处理高优先级任务。',
      countdownCards: [
        { id: 'card_0318_1', title: '需求确认', subtitle: '测试内容：与产品同步本周迭代细节', badge: '1天' },
        { id: 'card_0318_2', title: '接口联调', subtitle: '测试内容：准备前后端联调清单', badge: '3天' },
      ],
    },
    19: {
      keys: ['summary-0319'],
      todoKeys: ['todo-0319-a'],
      workflowKeys: ['workflow-0319-a'],
      detailBodyText: '3月19日：当日有待办与历史流程，请同时关注执行与回顾。',
      countdownCards: [
        { id: 'card_0319_1', title: '测试消息模板 A', subtitle: '测试内容：这是第一条倒计时消息', badge: '1天' },
        { id: 'card_0319_2', title: '测试消息模板 B', subtitle: '测试内容：这是第二条倒计时消息', badge: '3天' },
      ],
    },
    20: {
      keys: ['summary-0320'],
      workflowKeys: ['workflow-0320-a'],
      detailBodyText: '3月20日：建议完成流程节点归档，确保里程碑状态更新。',
      countdownCards: [
        { id: 'card_0320_1', title: '里程碑检查', subtitle: '测试内容：核对流程里程碑与交付状态', badge: '2天' },
      ],
    },
    22: {
      keys: ['summary-0322'],
      todoKeys: ['todo-0322-a'],
      workflowKeys: ['workflow-0322-a'],
      detailBodyText: '3月22日：代办与工作流并行，注意同步风险项和依赖项。',
      countdownCards: [
        { id: 'card_0322_1', title: '发布前准备', subtitle: '测试内容：整理上线前检查项', badge: '1天' },
        { id: 'card_0322_2', title: '历史记录复核', subtitle: '测试内容：确认关键流程日志完整', badge: '4天' },
      ],
    },
    24: {
      keys: ['summary-0324'],
      todoKeys: ['todo-0324-a'],
      workflowKeys: ['workflow-0324-a'],
      detailBodyText: '3月24日：请完成版本收尾，更新任务看板并发送日报。',
      countdownCards: [
        { id: 'card_0324_1', title: '版本收尾', subtitle: '测试内容：完成回归与文档整理', badge: '2天' },
      ],
    },
  },
  4: {
    16: {
      keys: ['summary-0416'],
      workflowKeys: ['workflow-0416-a'],
      detailBodyText: '4月16日：已归档 1 条历史工作流记录，请按计划推进。',
      countdownCards: [
        { id: 'card_0416_1', title: '流程复盘提醒', subtitle: '测试内容：检查上周工作流节点完成情况', badge: '2天' },
      ],
    },
    18: {
      keys: ['summary-0418'],
      todoKeys: ['todo-0418-a'],
      detailBodyText: '4月18日：今日待办较多，建议优先处理高优先级任务。',
      countdownCards: [
        { id: 'card_0418_1', title: '需求确认', subtitle: '测试内容：与产品同步本周迭代细节', badge: '1天' },
        { id: 'card_0418_2', title: '接口联调', subtitle: '测试内容：准备前后端联调清单', badge: '3天' },
      ],
    },
    19: {
      keys: ['summary-0419'],
      todoKeys: ['todo-0419-a'],
      workflowKeys: ['workflow-0419-a'],
      detailBodyText: '4月19日：当日有待办与历史流程，请同时关注执行与回顾。',
      countdownCards: [
        { id: 'card_0419_1', title: '测试消息模板 A', subtitle: '测试内容：这是第一条倒计时消息', badge: '1天' },
        { id: 'card_0419_2', title: '测试消息模板 B', subtitle: '测试内容：这是第二条倒计时消息', badge: '3天' },
      ],
    },
    20: {
      keys: ['summary-0420'],
      workflowKeys: ['workflow-0420-a'],
      detailBodyText: '4月20日：建议完成流程节点归档，确保里程碑状态更新。',
      countdownCards: [
        { id: 'card_0420_1', title: '里程碑检查', subtitle: '测试内容：核对流程里程碑与交付状态', badge: '2天' },
      ],
    },
    22: {
      keys: ['summary-0422'],
      todoKeys: ['todo-0422-a'],
      workflowKeys: ['workflow-0422-a'],
      detailBodyText: '4月22日：代办与工作流并行，注意同步风险项和依赖项。',
      countdownCards: [
        { id: 'card_0422_1', title: '发布前准备', subtitle: '测试内容：整理上线前检查项', badge: '1天' },
        { id: 'card_0422_2', title: '历史记录复核', subtitle: '测试内容：确认关键流程日志完整', badge: '4天' },
      ],
    },
    24: {
      keys: ['summary-0424'],
      todoKeys: ['todo-0424-a'],
      workflowKeys: ['workflow-0424-a'],
      detailBodyText: '4月24日：请完成版本收尾，更新任务看板并发送日报。',
      countdownCards: [
        { id: 'card_0424_1', title: '版本收尾', subtitle: '测试内容：完成回归与文档整理', badge: '2天' },
      ],
    },
  },
};

// 获取当前登录用户ID
async function getUserId(): Promise<string | null> {
  try {
    const authRaw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (authRaw) {
      const authState = JSON.parse(authRaw);
      if (authState.isLoggedIn && authState.userId) {
        return authState.userId;
      }
    }
  } catch {
    // 静默失败
  }
  return null;
}

// 从本地存储读取日历数据
async function loadFromStorage(): Promise<PortalCalendarData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// 保存日历数据到本地存储
async function saveToStorage(data: PortalCalendarData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 静默失败
  }
}

// 合并本地和服务器数据
function mergeCalendarData(local: PortalCalendarData, server: PortalMonthData, month: number): PortalCalendarData {
  return {
    ...local,
    [month]: { ...local[month], ...server },
  };
}

// 加载指定月份的数据（本地优先 + 后台同步）
export async function loadMonthData(year: number, month: number): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  try {
    const serverData = await portalApi.getMonthCalendar(userId, year, month);
    const localData = (await loadFromStorage()) || PORTAL_CALENDAR_DATA;
    const merged = mergeCalendarData(localData, serverData, month);
    await saveToStorage(merged);
  } catch {
    // 静默失败
  }
}

// 更新单日数据（本地优先 + 后台同步）
export async function updatePortalDayData(
  year: number,
  month: number,
  day: number,
  dayData: PortalDayData
): Promise<void> {
  const localData = (await loadFromStorage()) || PORTAL_CALENDAR_DATA;
  const updated = {
    ...localData,
    [month]: {
      ...localData[month],
      [day]: dayData,
    },
  };
  await saveToStorage(updated);

  const userId = await getUserId();
  if (userId) {
    try {
      await portalApi.updateDayData(userId, year, month, day, dayData);
    } catch {
      // 静默失败
    }
  }
}

// 删除单日数据（本地优先 + 后台同步）
export async function deletePortalDayData(year: number, month: number, day: number): Promise<void> {
  const localData = (await loadFromStorage()) || PORTAL_CALENDAR_DATA;
  if (localData[month]) {
    const { [day]: _, ...rest } = localData[month];
    const updated = { ...localData, [month]: rest };
    await saveToStorage(updated);
  }

  const userId = await getUserId();
  if (userId) {
    try {
      await portalApi.deleteDayData(userId, year, month, day);
    } catch {
      // 静默失败
    }
  }
}

export function getPortalDayData(month: number, day: number): PortalDayData | undefined {
  return PORTAL_CALENDAR_DATA[month]?.[day];
}

export function getPortalDetailBody(month: number, day: number): string | undefined {
  return getPortalDayData(month, day)?.detailBodyText;
}

export function getPortalCountdownCards(month: number, day: number): PortalCountdownCard[] | undefined {
  return getPortalDayData(month, day)?.countdownCards;
}

export function getPortalDayContent(month: number, day: number) {
  const dayData = getPortalDayData(month, day);
  return {
    detailBodyText: dayData?.detailBodyText,
    countdownCards: dayData?.countdownCards,
  };
}

export function hasTodoData(month: number, day: number): boolean {
  const data = getPortalDayData(month, day);
  return Boolean(data?.todoKeys?.length);
}

export function hasWorkflowData(month: number, day: number): boolean {
  const data = getPortalDayData(month, day);
  return Boolean(data?.workflowKeys?.length);
}

export function hasAnyPortalData(month: number, day: number): boolean {
  const data = getPortalDayData(month, day);
  return Boolean(data && (data.keys.length || data.todoKeys?.length || data.workflowKeys?.length));
}
