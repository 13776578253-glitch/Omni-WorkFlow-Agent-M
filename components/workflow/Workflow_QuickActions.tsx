import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import type { QuickActionNames, QuickActionPrompts } from '@/constants/type';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

export const QUICK_ACTIONS = [
  { key: 'solt1', fallbackLabel: '预设快捷位 1' },
  { key: 'solt2', fallbackLabel: '预设快捷位 2' },
  { key: 'solt3', fallbackLabel: '预设快捷位 3' },
  { key: 'solt4', fallbackLabel: '预设快捷位 4' },
] as const;

export type QuickActionKey = (typeof QUICK_ACTIONS)[number]['key'];
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// 图标
const DEFAULT_ICON: IoniconName = 'document-text-outline';
const ICON_RULES: { icon: IoniconName; keywords: string[] }[] = [
  { icon: 'mic-outline', keywords: ['录音', '录制', '音频', '语音', 'record', 'audio', 'voice'] },
  { icon: 'document-text-outline', keywords: ['文档', '文章', 'document', 'article', 'doc', 'text'] },
  { icon: 'clipboard-outline', keywords: ['会议', '记录', '纪要', 'meeting', 'minutes', 'log'] },
  { icon: 'git-network-outline', keywords: ['ppt','PPT','ai ppt','AI PPT', '思维导图', '脑图', '流程图', 'mindmap', 'slide'] },
  { icon: 'stats-chart-outline', keywords: ['数据处理', '数据分析', 'data', 'analysis', 'analytics', 'etl'] },
];

function resolveQuickActionIcon(content: string): IoniconName {
  const value = content.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((keyword) => value.includes(keyword))) {
      return rule.icon;
    }
  }
  return DEFAULT_ICON;
}

interface WorkflowQuickActionsProps {
  onAction?: (key: QuickActionKey) => void;
  quickActionNames?: Partial<QuickActionNames>;
  quickActionPrompts?: Partial<QuickActionPrompts>;
}

export function WorkflowQuickActions({ onAction, quickActionNames, quickActionPrompts }: WorkflowQuickActionsProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  return (
    // 横向滚动容器
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {QUICK_ACTIONS.map((action) => {
        const customLabel = quickActionNames?.[action.key]?.trim();
        const label = customLabel ? customLabel : action.fallbackLabel;
        const prompt = quickActionPrompts?.[action.key]?.trim() ?? '';
        const icon = resolveQuickActionIcon(`${label} ${prompt}`);

        // 单个卡片 渲染
        return (
          <TouchableOpacity
            key={action.key}
            activeOpacity={0.8}
            style={[styles.chip, { backgroundColor: cardColor }]}
            onPress={() => onAction?.(action.key)}
          >
            <Ionicons name={icon} size={16} color={textColor} />
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
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
