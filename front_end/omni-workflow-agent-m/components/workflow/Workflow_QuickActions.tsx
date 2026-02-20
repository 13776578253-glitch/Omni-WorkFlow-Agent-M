import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

const QUICK_ACTIONS = [
  { key: 'ai_ppt', label: 'AI ppt', icon: 'document-text-outline' as const },
  { key: 'upload_audio', label: '上传录音', icon: 'mic-outline' as const },
  { key: 'translate_secondary', label: '翻译', icon: 'language-outline' as const },
] as const;

export type QuickActionKey = (typeof QUICK_ACTIONS)[number]['key'];

interface WorkflowQuickActionsProps {
  onAction?: (key: QuickActionKey) => void;
}

export function WorkflowQuickActions({ onAction }: WorkflowQuickActionsProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.row}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.key}
          activeOpacity={0.8}
          style={[styles.chip, { backgroundColor: cardColor }]}
          onPress={() => onAction?.(action.key)}
        >
          <Ionicons name={action.icon} size={16} color={textColor} />
          <Text style={[styles.label, { color: textColor }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#7A7A7A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  label: {
    fontSize: 13,
    marginLeft: 6,
  },
});
