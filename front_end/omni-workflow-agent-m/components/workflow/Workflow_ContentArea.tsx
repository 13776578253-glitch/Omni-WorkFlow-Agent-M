import React from 'react';
import { View } from 'react-native';

import { WorkflowWelcomeArea } from '@/components/workflow/workflow_Welcome_Area';

import type { WorkflowBlock, WorkflowMode } from '@/constants/workflow_type';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_INITIAL_MESSAGES } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_Data';
import { WorkflowContextList } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_List';

// 重导出 类型和数据  / 保证向后兼容
export { DEFAULT_INITIAL_MESSAGES };
export type { WorkflowBlock };

interface WorkflowContentAreaProps {
  mode: WorkflowMode;                                     // 模式
  messages?: WorkflowBlock[];                             // 流消息
  contentPaddingTop?: number;                             // 内容顶部内边距
  onScrollOffsetChange?: (offsetY: number) => void;       // 滚动偏移量
  onBlockSave?: (id: string, newContent: string) => void; // 块保存回调
  firstQuestionLocked?: boolean;                          // 首问锁定状态
}

export function WorkflowContentArea({
  mode,
  messages,
  contentPaddingTop,
  onScrollOffsetChange,
  onBlockSave,
  firstQuestionLocked,
}: WorkflowContentAreaProps) {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // 模式分支：欢迎页 / 流消息列表
  if (mode === 'welcome') {
    return <WorkflowWelcomeArea bgColor={bgColor} textColor={textColor} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <WorkflowContextList
        messages={messages}
        // 内容顶部内边距 / 适配欢迎页占位高度
        contentPaddingTop={contentPaddingTop}
        // 滚动偏移量回调
        onScrollOffsetChange={onScrollOffsetChange}
        // 块保存回调
        onBlockSave={onBlockSave}
        firstQuestionLocked={firstQuestionLocked}
      />
    </View>
  );
}
