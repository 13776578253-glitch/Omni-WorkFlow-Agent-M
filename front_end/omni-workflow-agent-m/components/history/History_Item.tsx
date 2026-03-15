import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import type { HistorySession } from '@/services/history/History_Storage';

interface HistoryItemProps {
  session: HistorySession;
  onPress: (session: HistorySession) => void;
  onLongPress: (session: HistorySession) => void;
}

function formatDate(ts: number): string {
  const now = new Date();
  const d = new Date(ts);

  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isSameDay) {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  const isSameYear = d.getFullYear() === now.getFullYear();
  if (isSameYear) {
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function History_Item({ session, onPress, onLongPress }: HistoryItemProps) {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      delayLongPress={400}
      onPress={() => onPress(session)}
      onLongPress={() => onLongPress(session)}
      style={[styles.row, { borderBottomColor: themeColors.border }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
          {session.title}
        </Text>
        <Text style={[styles.date, { color: themeColors.icon }]}>
          {formatDate(session.createdAt)}
        </Text>
      </View>

      {session.isPinned && (
        <Ionicons name="pin" size={14} color={themeColors.icon} style={styles.pinIcon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
  },
  pinIcon: {
    marginLeft: 10,
    transform: [{ rotate: '45deg' }],
  },
});
