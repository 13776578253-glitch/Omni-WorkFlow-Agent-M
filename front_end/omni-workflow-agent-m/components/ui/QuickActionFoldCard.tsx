import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';

interface QuickActionFoldCardProps {
  title: string;
  defaultTitle: string;
  prompt: string;
  expanded: boolean;
  textColor: string;
  cardColor: string;
  borderColor: string;
  onToggle: () => void;
  onDelete: () => void;
  onChangeTitle: (value: string) => void;
  onChangePrompt: (value: string) => void;
}

export function QuickActionFoldCard({
  title,
  defaultTitle,
  prompt,
  expanded,
  textColor,
  cardColor,
  borderColor,
  onToggle,
  onDelete,
  onChangeTitle,
  onChangePrompt,
}: QuickActionFoldCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}> 
      <View
        style={[
          styles.header,
          expanded && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        ]}
      >
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          style={[styles.headerTitleInput, { color: textColor }]}
          placeholder={defaultTitle}
          placeholderTextColor={textColor + '66'}
        />

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onToggle} style={[styles.actionButton, { borderColor }]} activeOpacity={0.75}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={textColor + 'AA'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton} activeOpacity={0.75}>
            <Ionicons name="trash-outline" size={15} color="#ff453a" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded ? (
        <View style={styles.body}>
          <ThemedText style={[styles.editorLabel, { color: textColor + '88' }]}>预设指令</ThemedText>
          <View style={[styles.promptWrap, { borderColor }]}> 
            <TextInput
              value={prompt}
              onChangeText={onChangePrompt}
              multiline
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
    borderWidth: StyleSheet.hairlineWidth,
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
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    backgroundColor: 'rgba(127,127,127,0.04)',
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
