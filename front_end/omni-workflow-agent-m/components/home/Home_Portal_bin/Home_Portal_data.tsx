export type PortalDayData = {
  keys: string[];
  todoKeys?: string[];
  workflowKeys?: string[];
};

export type PortalMonthData = {
  [day: number]: PortalDayData;
};

export type PortalCalendarData = {
  [month: number]: PortalMonthData;
};

// 模拟数据 / 测试 / 结构设计：按月-日分层，方便查询和扩展
const PORTAL_CALENDAR_DATA: PortalCalendarData = {
  3: {
    16: {
      keys: ['summary-0316'],
      workflowKeys: ['workflow-0316-a'],
    },
    18: {
      keys: ['summary-0318'],
      todoKeys: ['todo-0318-a'],
    },
    19: {
      keys: ['summary-0319'],
      todoKeys: ['todo-0319-a'],
      workflowKeys: ['workflow-0319-a'],
    },
    20: {
      keys: ['summary-0320'],
      workflowKeys: ['workflow-0320-a'],
    },
    22: {
      keys: ['summary-0322'],
      todoKeys: ['todo-0322-a'],
      workflowKeys: ['workflow-0322-a'],
    },
    24: {
      keys: ['summary-0324'],
      todoKeys: ['todo-0324-a'],
      workflowKeys: ['workflow-0324-a'],
    },
  },
};

export function getPortalDayData(month: number, day: number): PortalDayData | undefined {
  return PORTAL_CALENDAR_DATA[month]?.[day];
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
