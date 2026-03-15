// app/(main)/history.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import History_ActionSheet from '@/components/history/History_ActionSheet';
import History_List from '@/components/history/History_List';
import History_RenameModal from '@/components/history/History_RenameModal';

// 历史页  / 删除会话/加载会话/重命名/置顶状态  
import { deleteSession, loadSessions, renameSession, togglePin, type HistorySession } from '@/services/history/History_Storage';

interface HistoryScreenProps {
  searchQuery?: string;
}

// 历史页  / 父组件传入 导航和搜索状态
export default function HistoryScreen({ searchQuery = '' }: HistoryScreenProps) {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  // 会话列表状态 / 存储/当前选中
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);

  // 显示状态 / 待修改
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  useEffect(() => {
    loadSessions().then(setSessions);
  }, []);

  // 搜索过滤 / 置顶优先 + 时间排序
  const filtered = sessions
    .filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        (s.previewText ?? '').toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.createdAt - a.createdAt
    );

  // 会话操作 / 长按显示 /  待修改
  const handleLongPress = (session: HistorySession) => {
    setSelectedSession(session);
    setShowActionSheet(true);
  };

  // 会话跳转 / 待修改 
  const handlePress = (_session: HistorySession) => {
    // TODO: 实现跳转逻辑，传递 session.id 或其他标识
  };

  // 操作回调 / 删除/重命名/置顶  / 待修改
  const handleDelete = async (session: HistorySession) => {
    const updated = await deleteSession(session.id);
    setSessions(updated);
  };

  // 重命名回调 / 待修改
  const handleRename = (session: HistorySession) => {
    setSelectedSession(session);
    setShowRenameModal(true);
  };

  // 重命名确认回调 / 待修改
  const handleRenameConfirm = async (session: HistorySession, newTitle: string) => {
    const updated = await renameSession(session.id, newTitle);
    setSessions(updated);
  };

  // 置顶/取消置顶
  const handleTogglePin = async (session: HistorySession) => {
    const updated = await togglePin(session.id);
    setSessions(updated);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* 历史会话列表 */}
      <History_List
        sessions={filtered}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />

      {/* 操作表单 */}
      <History_ActionSheet
        session={selectedSession}
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onDelete={handleDelete}
        onRename={handleRename}
        onTogglePin={handleTogglePin}
      />

      {/* 重命名框 */}
      <History_RenameModal
        session={selectedSession}
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={handleRenameConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
