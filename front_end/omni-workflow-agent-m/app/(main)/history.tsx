// app/(main)/history.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import type { WorkflowShareType } from '@/constants/workflow_share';

import History_ActionSheet from '@/components/history/History_ActionSheet';
import History_List from '@/components/history/History_List';

import { deleteSession, loadSessions, renameSession, togglePin, type HistorySession } from '@/services/history/History_Storage';
import { SessionManager } from '@/services/workflow/Session_Manager';
import { shareWorkflowSessionPayload } from '@/services/workflow/Workflow_Share_Builder';

interface HistoryScreenProps {
  onOpenSession?: (sessionId: string) => Promise<void> | void;
  refreshToken?: number;
  searchQuery?: string;
}

export default function HistoryScreen({ onOpenSession, refreshToken = 0, searchQuery = '' }: HistoryScreenProps) {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载会话列表
  useFocusEffect(
    React.useCallback(() => {
      void loadSessions().then(setSessions);
    }, [])
  );

  React.useEffect(() => {
    void loadSessions().then(setSessions);
  }, [refreshToken]);

  // 搜索过滤 + 置顶排序
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
  
  // 会话操作：打开、删除、重命名、置顶/取消置顶
  const handleLongPress = (session: HistorySession) => {
    setSelectedSession(session);
    setShowActionSheet(true);
  };

  const handlePress = async (session: HistorySession) => {
    setIsLoading(true);
    if (onOpenSession) {
      await onOpenSession(session.id);
    } else {
      await SessionManager.setCurrentSessionId(session.id);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleDelete = async (session: HistorySession) => {
    const updated = await deleteSession(session.id);
    setSessions(updated);
  };

  const handleRename = (session: HistorySession) => {
    setEditingSessionId(session.id);
  };

  const handleRenameConfirm = async (session: HistorySession, newTitle: string) => {
    // 乐观更新 UI，等待服务器响应后再更新列表 / 测试
    const optimistic = sessions.map((s) => (s.id === session.id ? { ...s, title: newTitle } : s));
    setSessions(optimistic);
    setEditingSessionId(null);
    const updated = await renameSession(session.id, newTitle);
    setSessions(updated);
  };

  const handleRenameCancel = () => {
    setEditingSessionId(null);
  };

  const handleTogglePin = async (session: HistorySession) => {
    const updated = await togglePin(session.id);
    setSessions(updated);
  };

  // 分享会话：提供分享选项，调用分享服务 / 测试 / 待修改
  const handleShareByType = async (session: HistorySession, shareType: WorkflowShareType) => {
    try {
      await shareWorkflowSessionPayload({
        sessionId: session.id,
        shareType,
      });
    } catch {
      Alert.alert('分享失败', '暂时无法导出这个会话，请稍后重试。');
    }
  };

  const handleShare = (session: HistorySession) => {
    Alert.alert('分享会话', '选择要分享的内容类型', [
      {
        text: '最终结果',
        onPress: () => {
          void handleShareByType(session, 'final_result');
        },
      },
      {
        text: '语义会话',
        onPress: () => {
          void handleShareByType(session, 'session_semantic');
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <History_List
        sessions={filtered}
        onPress={handlePress}
        onLongPress={handleLongPress}
        editingSessionId={editingSessionId}
        onRenameConfirm={handleRenameConfirm}
        onRenameCancel={handleRenameCancel}
      />

      <History_ActionSheet
        session={selectedSession}
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onDelete={handleDelete}
        onRename={handleRename}
        onTogglePin={handleTogglePin}
        onShare={handleShare}
      />

      {/* 加载指示器 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={themeColors.tint} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
