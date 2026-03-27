import AsyncStorage from '@react-native-async-storage/async-storage';
import * as historyApi from '@/api/history-api';

const STORAGE_KEY = '@omni_history_sessions_v1';
const AUTH_STORAGE_KEY = '@omni_workflow_user_auth_v1';

export interface HistorySession {
  id: string;           // id / 测试 / UUID
  title: string;        // 会话标题
  createdAt: number;    // 创建时间戳
  isPinned: boolean;    // 置顶状态
  previewText?: string; // 预览文本（可选）
}

// 模拟数据 / 空值填充数据 / 测试
const MOCK_SESSIONS: HistorySession[] = [
  {
    id: 'mock-1',
    title: '正畸微植钉术后剧痛缓解',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    isPinned: true,
    previewText: '请问微植钉术后疼痛如何缓解...',
  },
  {
    id: 'mock-2',
    title: '电脑中病毒 求助排查解决方案',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    isPinned: false,
    previewText: '电脑突然变得很慢，杀毒软件检测到威胁...',
  },
  {
    id: 'mock-3',
    title: '腾讯元宝AI多轮编辑辱骂事件',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 19,
    isPinned: false,
    previewText: '关于最近的 AI 事件分析...',
  },
  {
    id: 'mock-4',
    title: 'SteamDB 官网与游戏价格查询',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 19,
    isPinned: false,
    previewText: '如何通过 SteamDB 查看历史价格...',
  },
  {
    id: 'mock-5',
    title: 'CPU vs GPU瓶颈：分辨率决定',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 26,
    isPinned: false,
    previewText: '在高分辨率下 GPU 通常是瓶颈...',
  },
  {
    id: 'mock-6',
    title: '大拇指尖刺痛恢复时间',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    isPinned: false,
    previewText: '手指刺痛通常与神经压迫有关...',
  },
  {
    id: 'mock-7',
    title: 'ReShade RTGI 光追插件原理',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    isPinned: false,
    previewText: 'ReShade 使用屏幕空间光追技术...',
  },
];

// 私有 API
// 读取原始数据 / 写入原始数据
async function readRaw(): Promise<HistorySession[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function writeRaw(sessions: HistorySession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

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

// 公共 API
// 加载会话 / 保存会话 / 添加会话 / 删除会话 / 重命名会话 / 切换置顶状态
export async function loadSessions(): Promise<HistorySession[]> {
  const stored = await readRaw();
  const localSessions = stored !== null ? stored : MOCK_SESSIONS;

  // 如果已登录，尝试从服务器加载
  const userId = await getUserId();
  if (userId) {
    try {
      const serverSessions = await historyApi.getSessions(userId);
      // 合并本地和服务器数据（服务器优先）
      const mergedMap = new Map<string, HistorySession>();
      localSessions.forEach(s => mergedMap.set(s.id, s));
      serverSessions.forEach(s => mergedMap.set(s.id, s));
      const merged = Array.from(mergedMap.values());
      await writeRaw(merged);
      return merged;
    } catch {
      // 静默失败，使用本地数据
    }
  }

  // 初始化或使用本地数据
  if (stored === null) {
    await writeRaw(MOCK_SESSIONS);
    return MOCK_SESSIONS;
  }
  return localSessions;
}

export async function saveSessions(sessions: HistorySession[]): Promise<void> {
  await writeRaw(sessions);
}

export async function addSession(session: HistorySession): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = [session, ...sessions];
  await writeRaw(updated);

  // 如果已登录，同步到服务器
  const userId = await getUserId();
  if (userId) {
    try {
      await historyApi.createSession(userId, session.title, session.previewText);
    } catch {
      // 静默失败
    }
  }

  return updated;
}

export async function deleteSession(id: string): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = sessions.filter((s) => s.id !== id);
  await writeRaw(updated);

  // 如果已登录，同步到服务器
  const userId = await getUserId();
  if (userId) {
    try {
      await historyApi.deleteSession(userId, id);
    } catch {
      // 静默失败
    }
  }

  return updated;
}

export async function renameSession(id: string, newTitle: string): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
  await writeRaw(updated);

  // 如果已登录，同步到服务器
  const userId = await getUserId();
  if (userId) {
    try {
      await historyApi.renameSession(userId, id, newTitle);
    } catch {
      // 静默失败
    }
  }

  return updated;
}

export async function togglePin(id: string): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = sessions.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  await writeRaw(updated);

  // 如果已登录，同步到服务器
  const userId = await getUserId();
  if (userId) {
    try {
      const session = updated.find(s => s.id === id);
      if (session) {
        await historyApi.togglePinSession(userId, id, session.isPinned);
      }
    } catch {
      // 静默失败
    }
  }

  return updated;
}
