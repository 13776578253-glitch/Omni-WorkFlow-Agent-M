import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import type { QuickActionNames } from '@/constants/type';

export const QUICK_ACTIONS = [
  { key: 'solt1', fallbackLabel: 'Preset 1', icon: 'document-text-outline' as const },
  { key: 'solt2', fallbackLabel: 'Preset 2', icon: 'mic-outline' as const },
  { key: 'solt3', fallbackLabel: 'Preset 3', icon: 'language-outline' as const },
  { key: 'solt4', fallbackLabel: 'Preset 4', icon: 'sparkles-outline' as const },
] as const;

export type QuickActionKey = (typeof QUICK_ACTIONS)[number]['key'];

interface WorkflowQuickActionsProps {
  onAction?: (key: QuickActionKey) => void;
  quickActionNames?: Partial<QuickActionNames>;
}

export function WorkflowQuickActions({ onAction, quickActionNames }: WorkflowQuickActionsProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.row}>
      {QUICK_ACTIONS.map((action) => {
        const customLabel = quickActionNames?.[action.key]?.trim();
        const label = customLabel ? customLabel : action.fallbackLabel;

        return (
          <TouchableOpacity
            key={action.key}
            activeOpacity={0.8}
            style={[styles.chip, { backgroundColor: cardColor }]}
            onPress={() => onAction?.(action.key)}
          >
            <Ionicons name={action.icon} size={16} color={textColor} />
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
