import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@omni_history_sessions_v1';

export interface HistorySession {
  id: string;
  title: string;
  createdAt: number;    // ms timestamp
  isPinned: boolean;
  previewText?: string;
}

// ── Mock seeds (used when storage is empty) ─────────────────────────────────
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

// ── Internal helpers ──────────────────────────────────────────────────────────

async function readRaw(): Promise<HistorySession[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function writeRaw(sessions: HistorySession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Load sessions. Seeds mock data if storage is empty. */
export async function loadSessions(): Promise<HistorySession[]> {
  const stored = await readRaw();
  if (stored !== null) return stored;
  // First run: seed mock data
  await writeRaw(MOCK_SESSIONS);
  return MOCK_SESSIONS;
}

export async function saveSessions(sessions: HistorySession[]): Promise<void> {
  await writeRaw(sessions);
}

export async function addSession(session: HistorySession): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = [session, ...sessions];
  await writeRaw(updated);
  return updated;
}

export async function deleteSession(id: string): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = sessions.filter((s) => s.id !== id);
  await writeRaw(updated);
  return updated;
}

export async function renameSession(id: string, newTitle: string): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
  await writeRaw(updated);
  return updated;
}

export async function togglePin(id: string): Promise<HistorySession[]> {
  const sessions = await loadSessions();
  const updated = sessions.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  await writeRaw(updated);
  return updated;
}
