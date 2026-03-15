import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

import type { HistorySession } from '@/services/history/History_Storage';

interface HistoryItemProps {
  session: HistorySession;
  onPress: (session: HistorySession) => void;
  onLongPress: (session: HistorySession) => void;
  isEditing?: boolean;
  onRenameConfirm?: (newTitle: string) => void;
  onRenameCancel?: () => void;
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

export default function History_Item({
  session,
  onPress,
  onLongPress,
  isEditing = false,
  onRenameConfirm,
  onRenameCancel,
}: HistoryItemProps) {
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  const [editText, setEditText] = useState(session.title);
  const confirmedRef = useRef(false);
  const inputRef = useRef<TextInput>(null);

  // isEditing 变为 true 时重置文本并手动聚焦（autoFocus 仅在 mount 时生效，这里用 ref）
  useEffect(() => {
    if (isEditing) {
      setEditText(session.title);
      confirmedRef.current = false;
      // 延一帧确保 TextInput 已渲染再 focus
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isEditing, session.title]);

  const handleConfirm = () => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    const trimmed = editText.trim();
    onRenameConfirm?.(trimmed || session.title);
  };

  const handleBlur = () => {
    if (confirmedRef.current) return;
    // Blur without Enter = cancel
    onRenameCancel?.();
  };

  const editingBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  if (isEditing) {
    return (
      <View
        style={[
          styles.row,
          { borderBottomColor: themeColors.border, backgroundColor: editingBg },
        ]}
      >
        <View style={styles.content}>
          <TextInput
            ref={inputRef}
            value={editText}
            onChangeText={setEditText}
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
            onBlur={handleBlur}
            style={[styles.editInput, { color: themeColors.text }]}
            selectionColor={themeColors.tint}
          />
          <Text style={[styles.date, { color: themeColors.icon }]}>
            {formatDate(session.createdAt)}
          </Text>
        </View>

        {session.isPinned && (
          <Ionicons name="pin" size={14} color={themeColors.icon} style={styles.pinIcon} />
        )}
      </View>
    );
  }

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
  editInput: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    padding: 0,           // remove default TextInput padding to match Text visually
    margin: 0,
  },
  date: {
    fontSize: 13,
  },
  pinIcon: {
    marginLeft: 10,
    transform: [{ rotate: '45deg' }],
  },
});
