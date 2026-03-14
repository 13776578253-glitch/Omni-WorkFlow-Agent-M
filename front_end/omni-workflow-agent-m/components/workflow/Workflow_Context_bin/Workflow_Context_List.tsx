import React, { useEffect, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_WORKFLOW_MESSAGES, WorkflowMessage } from './Workflow_Context_Data';
import { WorkflowMessageItem } from './Workflow_Message_Item';

interface WorkflowContextListProps {
  initialMessages?: WorkflowMessage[];               // 初始消息列表
  contentPaddingTop?: number;                        // 内容顶部内边距
  onScrollOffsetChange?: (offsetY: number) => void;  // 滚动偏移量
}

export function WorkflowContextList({
  initialMessages = DEFAULT_WORKFLOW_MESSAGES,
  contentPaddingTop,
  onScrollOffsetChange,
}: WorkflowContextListProps) {
  const [messages, setMessages] = useState<WorkflowMessage[]>(initialMessages);
  const bgColor = useThemeColor({}, 'background');

  // 初始化消息列表
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // 更新消息内容
  const handleUpdateMessage = (id: string, newText: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, text: newText } : msg
      )
    );
  };

  // 处理滚动事件
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollOffsetChange?.(event.nativeEvent.contentOffset.y);
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
