import React from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_INITIAL_MESSAGES, WorkflowMessage } from './Workflow_Context_Data';
import { WorkflowMessageItem } from './Workflow_Message_Item';

interface WorkflowContextListProps {
  messages?: WorkflowMessage[];                             // 消息列表
  contentPaddingTop?: number;                               // 内容顶部内边距
  onScrollOffsetChange?: (offsetY: number) => void;         // 滚动偏移量
  onMessageUpdate?: (id: string, newText: string) => void;  // 消息更新回调
}

export function WorkflowContextList({
  messages = DEFAULT_INITIAL_MESSAGES,
  contentPaddingTop,
  onScrollOffsetChange,
  onMessageUpdate,
}: WorkflowContextListProps) {
  const bgColor = useThemeColor({}, 'background');

  // 处理滚动事件
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollOffsetChange?.(event.nativeEvent.contentOffset.y);
  };

  const handleUpdateMessage = (id: string, newText: string) => {
    onMessageUpdate?.(id, newText);
  };

  return (
    <FlatList
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
      renderItem={({ item }) => (
        <WorkflowMessageItem 
          message={item} 
          onUpdate={handleUpdateMessage} 
        />
      )}
      // 分隔线组件
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

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
