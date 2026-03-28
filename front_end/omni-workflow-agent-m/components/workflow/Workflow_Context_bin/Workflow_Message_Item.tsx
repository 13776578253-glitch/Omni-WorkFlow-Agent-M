import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { WorkflowMarkdownEditor } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Editor';
import { WorkflowMarkdownRenderer } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Renderer';

import type { WorkflowBlock } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

// 工作流消息项组件
interface WorkflowMessageItemProps {
  message: WorkflowBlock;
  onUpdate: (id: string, newText: string) => void;
  isFirstBlock?: boolean;
  isLocked?: boolean;
}

export function WorkflowMessageItem({ message, onUpdate, isFirstBlock, isLocked }: WorkflowMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isUser = message.role === 'user';

  // 容器标识器 颜色 / 待处理
  const aiIndicatorColor = useThemeColor({ light: '#60A5FA', dark: '#60A5FA' }, 'tint'); 
  const userIndicatorColor = useThemeColor({ light: '#2DD4BF', dark: '#2DD4BF' }, 'tint'); 

  // 编辑处理 首问锁定时禁止编辑
  const handleEdit = () => {
    // 首问锁定时禁止编辑
    if (isFirstBlock && isLocked) {
      return;
    }
    setIsEditing(true);
  };

  // 保存编辑后的文本
  const handleSave = (newText: string) => {
    onUpdate(message.id, newText);
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, isUser ? styles.containerRight : styles.containerLeft]}>
      {/* AI 栏（左） */}
      {!isUser && (
        <View style={[styles.indicatorBar, { backgroundColor: aiIndicatorColor, marginRight: 12 }]} />
      )}

      <View style={[styles.contentWrapper, isUser ? { alignItems: 'flex-end' } : { width: '100%' }]}>
        {isEditing ? (
          <WorkflowMarkdownEditor
            initialContent={message.content}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <TouchableOpacity onPress={handleEdit} activeOpacity={0.8} style={styles.rendererContainer}>
            <WorkflowMarkdownRenderer content={message.content} align={isUser ? 'right' : 'left'} />
          </TouchableOpacity>
        )}
      </View>

      {/* User 栏（右） */}
      {isUser && (
        <View style={[styles.indicatorBar, { backgroundColor: userIndicatorColor, marginLeft: 12 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
    flexDirection: 'row',
  },
  containerLeft: {
    justifyContent: 'flex-start',
    paddingRight: 40, 
  },
  containerRight: {
    justifyContent: 'flex-end',
    paddingLeft: 40, 
  },
  contentWrapper: {
    flex: 1,
    // maxWidth: '100%', // 限制内容最大宽度，避免过宽
  },
  indicatorBar: {
    width: 4,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  rendererContainer: {
    paddingVertical: 8,
  },
});
