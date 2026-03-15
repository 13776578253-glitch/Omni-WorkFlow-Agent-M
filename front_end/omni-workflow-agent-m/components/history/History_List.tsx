import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import type { HistorySession } from '@/services/history/History_Storage';
import History_Item from './History_Item';

interface HistoryListProps {
  sessions: HistorySession[];
  onPress: (session: HistorySession) => void;
  onLongPress: (session: HistorySession) => void;
  editingSessionId?: string | null;
  onRenameConfirm?: (session: HistorySession, newTitle: string) => void;
  onRenameCancel?: () => void;
}

type ListEntry =
  | { type: 'header'; label: string; key: string }
  | { type: 'item'; session: HistorySession; key: string };  // 使用 session.id 作为 key / 测试

function buildListData(sessions: HistorySession[]): ListEntry[] {
  // 置顶优先 + 时间排序
  const pinned = sessions.filter((s) => s.isPinned);
  const normal = sessions.filter((s) => !s.isPinned);

  // 构建列表数据 / 分组标题和会话项
  const entries: ListEntry[] = [];

  if (pinned.length > 0) {
    entries.push({ type: 'header', label: '置顶', key: 'header-pinned' });
    pinned.forEach((s) => entries.push({ type: 'item', session: s, key: s.id }));
  }

  if (normal.length > 0) {
    entries.push({ type: 'header', label: '对话', key: 'header-normal' });
    normal.forEach((s) => entries.push({ type: 'item', session: s, key: s.id }));
  }

  return entries;
}

// 会话列表
export default function History_List({
  sessions,
  onPress,
  onLongPress,
  editingSessionId,
  onRenameConfirm,
  onRenameCancel,
}: HistoryListProps) {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  const data = buildListData(sessions);

  return (
    <FlatList
      data={data}
      keyExtractor={(entry) => entry.key}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: themeColors.icon }]}>{item.label}</Text>
            </View>
          );
        }
        return (
          <History_Item
            session={item.session}
            onPress={onPress}
            onLongPress={onLongPress}
            isEditing={item.session.id === editingSessionId}
            onRenameConfirm={(newTitle) => onRenameConfirm?.(item.session, newTitle)}
            onRenameCancel={onRenameCancel}
          />
        );
      }}
      // 空列表提示
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.icon }]}>暂无历史记录</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 110,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
  },
});
