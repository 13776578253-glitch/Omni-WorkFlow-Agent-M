import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';

// 提取 TextInput onFocus回调类型
type InputFocusHandler = React.ComponentProps<typeof TextInput>['onFocus'];

// 定义 组件接收参数 类型
interface QuickActionFoldCardProps {
  title: string;           
  defaultTitle: string;               // 名称 默认值 (占位符)
  prompt: string;
  promptMaxLength: number;            // 字数限制
  expanded: boolean;                  // 展开
  textColor: string;
  cardColor: string;
  onToggle: () => void;
  onDelete: () => void;
  onChangeTitle: (value: string) => void;
  onChangePrompt: (value: string) => void;
  onFocusTitle?: InputFocusHandler;   // 输入聚焦 / 回调 (可选)
  onFocusPrompt?: InputFocusHandler;  // 同上
}

export function QuickActionFoldCard({ 
  title, 
  defaultTitle, 
  prompt, 
  promptMaxLength, 
  expanded, 
  textColor, 
  cardColor,
  onToggle, 
  onDelete, 
  onChangeTitle, 
  onChangePrompt, 
  onFocusTitle, 
  onFocusPrompt 
}: QuickActionFoldCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}> 
      {/* 卡片预览 */}
      <View style={styles.header}>
         {/* 指令名称 输入框 */}
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          onFocus={onFocusTitle}
          style={[styles.headerTitleInput, { color: textColor }]}
          placeholder={defaultTitle}
          placeholderTextColor={textColor + '66'}
        />
        <View style={styles.headerActions}>
          {/* 折叠/展开 */}
          <TouchableOpacity onPress={onToggle} style={styles.actionButton} activeOpacity={0.75}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={textColor + 'AA'} />
          </TouchableOpacity>
          {/* 删除按钮 */}
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton} activeOpacity={0.75}>
            <Ionicons name="trash-outline" size={15} color="#ff453a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 卡片主题 / 展开时渲染 */}
      {expanded ? (
        <View style={styles.body}>
          {/* 指令标签 */}
          <ThemedText style={[styles.editorLabel, { color: textColor + '88' }]}>预设指令</ThemedText>
          {/* 输入框 */}
          <View style={styles.promptWrap}>
            <TextInput
              value={prompt}
              onChangeText={onChangePrompt}
              onFocus={onFocusPrompt}
              multiline
              maxLength={promptMaxLength}
              style={[styles.promptInput, { color: textColor }]}
              placeholder="输入该快捷位的预设指令"
              placeholderTextColor={textColor + '66'}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
  },
  headerTitleInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127,127,127,0.08)',
  },
  deleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,69,58,0.1)',
  },
  body: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  editorLabel: {
    fontSize: 10,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  promptWrap: {
    borderRadius: 10,
    backgroundColor: 'rgba(127,127,127,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  promptInput: {
    minHeight: 96,
    fontSize: 13,
    lineHeight: 19,
    textAlignVertical: 'top',
  },
});
