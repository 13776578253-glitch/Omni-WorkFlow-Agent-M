import React from 'react';
import { View } from 'react-native';

import { WorkflowWelcomeArea } from '@/components/workflow/workflow_Welcome_Area';

import type { WorkflowMode } from '@/constants/workflow_type';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_INITIAL_MESSAGES, WorkflowMessage } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_Data';
import { WorkflowContextList } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_List';

// 重导出 类型和数据  / 保证向后兼容
export { DEFAULT_INITIAL_MESSAGES };
export type { WorkflowMessage };

interface WorkflowContentAreaProps {
  mode: WorkflowMode;                                 // 模式
  messages?: WorkflowMessage[];                       // 流消息
  contentPaddingTop?: number;                         // 内容顶部内边距
  onScrollOffsetChange?: (offsetY: number) => void;   // 滚动偏移量
  onMessageUpdate?: (id: string, newText: string) => void; // 消息更新回调
}

export function WorkflowContentArea({
  mode,
  messages,
  contentPaddingTop,
  onScrollOffsetChange,
  onMessageUpdate,
}: WorkflowContentAreaProps) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  if (mode === 'welcome') {
    return <WorkflowWelcomeArea bgColor={bgColor} textColor={textColor} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <WorkflowContextList 
        messages={messages} 
        contentPaddingTop={contentPaddingTop}
        onScrollOffsetChange={onScrollOffsetChange}
        onMessageUpdate={onMessageUpdate}
      />
    </View>
  );
}
