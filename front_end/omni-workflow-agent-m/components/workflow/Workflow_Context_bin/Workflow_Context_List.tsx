import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import type { WorkflowBlock } from '@/constants/workflow_type';
import { DEFAULT_INITIAL_MESSAGES } from './Workflow_Context_Data';
import { WorkflowMessageItem } from './Workflow_Message_Item';

interface WorkflowContextListProps {
  messages?: WorkflowBlock[];                               // 消息列表
  contentPaddingTop?: number;                               // 内容顶部内边距
  onScrollOffsetChange?: (offsetY: number) => void;         // 滚动偏移量
  onBlockSave?: (id: string, newContent: string) => void;   // 块保存回调
  onPresentationStateChange?: (id: string, patch: Partial<WorkflowBlock>) => void;
  editableUserBlockId?: string | null;                      // 当前允许编辑的用户块
}

export interface WorkflowContextListRef {
  scrollToEnd: () => void;
}

// 工作流上下文消息列表组件
export const WorkflowContextList = forwardRef<WorkflowContextListRef, WorkflowContextListProps>((
  { messages = DEFAULT_INITIAL_MESSAGES, contentPaddingTop, onScrollOffsetChange, onBlockSave, onPresentationStateChange, editableUserBlockId = null },
  ref
) => {
  const bgColor = useThemeColor({}, 'background');
  const flatListRef = useRef<FlatList>(null);

  useImperativeHandle(ref, () => ({
    scrollToEnd: () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    },
  }));

  // 处理滚动事件
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollOffsetChange?.(event.nativeEvent.contentOffset.y);
  };

  const handleUpdateMessage = (id: string, newContent: string) => {
    onBlockSave?.(id, newContent);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      style={{ flex: 1, backgroundColor: bgColor }}
      contentContainerStyle={[
        styles.content,
        typeof contentPaddingTop === 'number' ? { paddingTop: contentPaddingTop } : null,
      ]}
      scrollEnabled                            // 滚动
      nestedScrollEnabled                      // 嵌套滚动
      showsVerticalScrollIndicator             // 显示垂直滚动指示器
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      renderItem={({ item, index }) => (
        <WorkflowMessageItem
          message={item}
          onUpdate={handleUpdateMessage}
          onPresentationStateChange={onPresentationStateChange}
          canEdit={item.role === 'ai' || item.id === editableUserBlockId}
        />
      )}
      // 分隔线组件
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
});

const styles = StyleSheet.create({
  content: {
    paddingTop: 104,
    paddingHorizontal: 20, 
    paddingVertical: 10,
    paddingBottom: 180,
  },
  separator: {
    height: 16,   // 消息间边距
  },
});
