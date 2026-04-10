import * as portalApi from '@/api/home-component-api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEffectiveUserId } from '@/services/auth/Demo_User';

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
    1: {
      keys: ['summary-0301'],
      workflowKeys: ['workflow-0301-class-notes', 'workflow-0301-intern-resume'],
      detailBodyText: '3月1日：上午用 AI 助手整理了《传播学概论》的课堂笔记，把原本零散的拍照文字转成了分主题摘要；晚上又顺手让它帮忙润色了实习简历，把“课程项目经历”和“社团组织经验”分开表述，整体更像正式投递版本。今天的记录偏学习和个人成长，内容不多，但已经开始把零散事项逐渐归档起来。',
      countdownCards: [
        { id: 'card_0301_1', title: '简历终稿确认', subtitle: '本周内要把实习简历定稿，方便后续集中投递内容运营和产品助理岗位。', badge: '4天' },
      ],
    },
    5: {
      keys: ['summary-0305'],
      workflowKeys: ['workflow-0305-presentation-outline', 'workflow-0305-daily-errands'],
      detailBodyText: '3月5日：下午请 AI 助手把一份课程展示资料拆成了“背景、问题、案例、结论”四段结构，后面做 PPT 时会轻松很多；晚些时候又顺手整理了这周几项琐碎事务，包括社团海报文案、快递清单和周末要交的材料。整体是比较典型的轻量使用日，偏向“整理”和“改写”。',
      countdownCards: [
        { id: 'card_0305_1', title: '课堂展示排版', subtitle: '需要在周末前把口头展示提纲转成更正式的 PPT 结构。', badge: '3天' },
      ],
    },
    7: {
      keys: ['summary-0307'],
      workflowKeys: ['workflow-0307-assignment-breakdown', 'workflow-0307-club-copy'],
      todoKeys: ['todo-0307-a'],
      detailBodyText: '3月7日：今天把一门课程的小组作业要求丢给 AI 助手，拆成了可执行的提交步骤，还顺带把组内分工写成了清单；晚上又帮社团活动润色了招募文案，改得比原版自然很多。因为下周要做展示，今天额外留下了一条计划任务，提醒自己不要只停留在提纲层面。',
      countdownCards: [
        { id: 'card_0307_1', title: '展示稿初稿完成', subtitle: '下周展示前要把课堂汇报稿补完整，至少先做出口播顺序和每页重点。', badge: '2天' },
        { id: 'card_0307_2', title: '小组作业材料回收', subtitle: '需要提醒组员把案例截图和引用来源发齐，避免最后补资料。', badge: '1天' },
      ],
    },
    11: {
      keys: ['summary-0311'],
      workflowKeys: ['workflow-0311-meeting-minutes', 'workflow-0311-study-plan'],
      detailBodyText: '3月11日：白天帮忙整理了一次学生项目会议纪要，AI 自动把讨论内容按“待确认、已决定、后续动作”归类出来；晚上又让它把本月复习计划压缩成一页便签版，适合贴在平板旁边反复看。今天的内容开始从单纯的写作辅助转向“记录和归档”，有点像真的在把生活和工作混合管理起来。',
      countdownCards: [
        { id: 'card_0311_1', title: '阶段汇报准备', subtitle: '需要在本周内把学生项目会议纪要提炼成一版可汇报摘要。', badge: '3天' },
      ],
    },
    13: {
      keys: ['summary-0313'],
      workflowKeys: ['workflow-0313-intern-posting', 'workflow-0313-email-polish'],
      detailBodyText: '3月13日：今天主要在做实习投递准备。先用 AI 助手筛了一遍几条岗位 JD，提炼出内容编辑和用户运营岗位最常见的关键词；之后又帮忙把一封发给老师的邮件修得更礼貌、更像正式申请。内容不算重，但很贴近日常使用场景，属于“把卡住的小事都顺手处理掉”的一天。',
      countdownCards: [
        { id: 'card_0313_1', title: '投递材料复核', subtitle: '这周要把简历、邮件模板和作品集说明放在同一个文件夹里统一检查。', badge: '2天' },
      ],
    },
    14: {
      keys: ['summary-0314'],
      workflowKeys: ['workflow-0314-project-brief', 'workflow-0314-portfolio-summary'],
      todoKeys: ['todo-0314-a'],
      detailBodyText: '3月14日：白天把一份实习项目说明书交给 AI 做了摘要提炼，重点抓出了可展示成果和个人负责部分；晚上继续整理作品集说明，把原本太口语化的项目描述改成了“问题-动作-结果”的表达。今天是典型的“准备往外展示自己”的日子，所以额外保留了一条待办，用来提醒后面还要继续收口材料。',
      countdownCards: [
        { id: 'card_0314_1', title: '作品集说明补全', subtitle: '还需要补上两个项目的成果截图和一句话亮点说明，方便下周投递。', badge: '3天' },
      ],
    },
    15: {
      keys: ['summary-0315'],
      workflowKeys: ['workflow-0315-weekly-review', 'workflow-0315-reading-summary'],
      detailBodyText: '3月15日：周末把这周零散事项做了一次复盘，AI 帮我把学习、投递、社团、展示几条线分开总结，看起来比纯待办列表更有条理；顺手还整理了一篇专业阅读材料，输出了便于复习的短摘要。今天没有新的计划任务，主要是做归档和总结，让下周开始时不至于混乱。',
      countdownCards: [
        { id: 'card_0315_1', title: '下周事项预热', subtitle: '建议提前确认展示安排和实习投递节奏，避免周一集中堆积。', badge: '2天' },
      ],
    },
    18: {
      keys: ['summary-0318'],
      workflowKeys: ['workflow-0318-front-end-notes', 'workflow-0318-report-outline'],
      detailBodyText: '3月18日：今天偏工作一点。下午把一份前端联调记录交给 AI 助手整理，自动按“已完成、待确认、风险点”三类输出；晚上又请它帮忙把周报提纲压缩成更像汇报的版本。相比前几天的学习内容，今天更像在使用一个真正的工作助手，专门处理沟通和记录。',
      countdownCards: [
        { id: 'card_0318_1', title: '周报口径统一', subtitle: '需要把联调记录和周报提纲统一成一套对外说法，方便后续汇报。', badge: '2天' },
      ],
    },
    28: {
      keys: ['summary-0328'],
      workflowKeys: ['workflow-0328-monthly-summary', 'workflow-0328-presentation-revision'],
      todoKeys: ['todo-0328-a'],
      detailBodyText: '3月28日：月底事情开始密集。先让 AI 把本月做过的几类任务汇总成月度总结草稿，再回头修改了一份展示材料，让表达更像给老师和同学看的正式版本。今天保留了一条计划任务，因为月底前还有内容要交，已经不适合只做归档不做提醒了。',
      countdownCards: [
        { id: 'card_0328_1', title: '阶段总结提交', subtitle: '月底前要把这段时间的学习与项目进展整理成一页正式总结。', badge: '2天' },
        { id: 'card_0328_2', title: '展示材料终版检查', subtitle: '需要再核对一次排版、图片来源和口播顺序，避免现场出错。', badge: '1天' },
      ],
    },
    29: {
      keys: ['summary-0329'],
      workflowKeys: ['workflow-0329-interview-qa', 'workflow-0329-notes-archive'],
      detailBodyText: '3月29日：今天一半像学生，一半像求职者。白天用 AI 模拟了一轮面试问答，把几个常见问题整理成回答提纲；晚上又把 3 月份留下来的课程笔记和项目说明做了归档分类。内容杂，但很真实，正好体现出 AI 助手在不同主题之间切换时的连续使用感。',
      countdownCards: [
        { id: 'card_0329_1', title: '面试问题复述', subtitle: '建议明天再过一遍自我介绍和项目经历，避免只记关键词不记表达。', badge: '1天' },
      ],
    },
  },
  4: {
    1: {
      keys: ['summary-0401'],
      workflowKeys: ['workflow-0401-paper-outline', 'workflow-0401-dorm-budget'],
      detailBodyText: '4月1日：已完成课程论文思路整理与生活事务归类。系统将原始论文想法拆解为可继续扩写的三级提纲，同时汇总了本月生活开销与宿舍采购事项，形成了更清晰的后续处理框架。',
      countdownCards: [
        { id: 'card_0401_1', title: '论文框架扩写', subtitle: '这周要把论文提纲继续扩成可写的段落说明，避免后面赶工。', badge: '4天' },
      ],
    },
    3: {
      keys: ['summary-0403'],
      workflowKeys: ['workflow-0403-holiday-plan', 'workflow-0403-demo-copy'],
      todoKeys: ['todo-0403-a'],
      detailBodyText: '4月3日：已整理清明前资料收口事项，并同步优化演示说明文案。系统将待携带文件、待备份资料和展示相关文本统一归纳，当前重点已明确为假期前完成材料打包与展示内容校正。',
      countdownCards: [
        { id: 'card_0403_1', title: '资料打包收口', subtitle: '离校前要确认电脑里的演示稿、课程资料和简历文件都已经同步备份。', badge: '1天' },
        { id: 'card_0403_2', title: '演示说明修订', subtitle: '还要把文案里的口语化表达再收一遍，方便后续直接展示。', badge: '2天' },
      ],
    },
    4: {
      keys: ['summary-0404'],
      workflowKeys: ['workflow-0404-reading-digest', 'workflow-0404-team-note'],
      detailBodyText: '4月4日：已完成阅读材料压缩整理与团队沟通记录归档。系统输出了更适合复习的短摘要版本，并同步保留了团队沟通要点，当前整体状态以信息沉淀和轻量维护为主。',
      countdownCards: [
        { id: 'card_0404_1', title: '假期后续排期', subtitle: '建议假期结束前把下周的重要学习和工作事项提前排一下。', badge: '3天' },
      ],
    },
    8: {
      keys: ['summary-0408'],
      workflowKeys: ['workflow-0408-homepage-review', 'workflow-0408-task-board-cleanup'],
      todoKeys: ['todo-0408-a'],
      detailBodyText: '4月8日：已完成首页展示内容复核与任务板清理。系统重新梳理了展示文案的重点与排序，并对遗留事项进行了归档和优先级重排；结合 4 月 9 日前的关键节点，当前计划任务已聚焦到最终检查与零碎事项收口。',
      countdownCards: [
        { id: 'card_0408_1', title: '展示前最终检查', subtitle: '明天前要把首页展示内容、讲解顺序和关键文案全部再过一遍。', badge: '1天' },
        { id: 'card_0408_2', title: '遗留事项收口', subtitle: '今晚要尽量清掉任务板上的零碎小项，避免第二天被打断节奏。', badge: '1天' },
      ],
    },
    9: {
      keys: ['summary-0409'],
      workflowKeys: ['workflow-0409-demo-retrospective', 'workflow-0409-history-sort'],
      detailBodyText: '4月9日：已完成阶段展示反馈整理与历史记录二次归档。系统将反馈内容归纳为“保留项、待修项、后续方向”三类，并同步完成历史记录重分类，当前已具备作为阶段性复盘节点继续向后延展的基础。',
      countdownCards: [
        { id: 'card_0409_1', title: '反馈归档', subtitle: '需要尽快把今天整理出来的修改建议沉淀成后续可执行清单。', badge: '2天' },
      ],
    },
  },
};

// 获取当前登录用户ID
async function getUserId(): Promise<string | null> {
  return getEffectiveUserId();
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
