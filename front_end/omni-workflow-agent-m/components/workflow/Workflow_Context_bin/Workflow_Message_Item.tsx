import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { WorkflowMarkdownEditor } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Editor';
import { WorkflowMarkdownRenderer } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Renderer';

interface WorkflowMessageItemProps {
  message: {                          
    id: string;
    role: 'user' | 'ai';
    text: string;
  };
  onUpdate: (id: string, newText: string) => void;   // 更新消息回调
}

export function WorkflowMessageItem({ message, onUpdate }: WorkflowMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  // 编辑点击事件
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 保存编辑后文本
  const handleSave = (newText: string) => {
    onUpdate(message.id, newText);
    setIsEditing(false);
  };

  // 取消编辑事件
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {isEditing ? (
        // 编辑模式： Markdown 编辑器
        <WorkflowMarkdownEditor 
          initialContent={message.text} 
          onSave={handleSave} 
          onCancel={handleCancel} 
        />
      ) : (
        // 查看模式：渲染 Markdown 内容
        <TouchableOpacity onPress={handleEdit} activeOpacity={0.8} style={styles.rendererContainer}>
          <WorkflowMarkdownRenderer content={message.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,   // 消息项间距
    width: '100%',
  },
  rendererContainer: {
    paddingVertical: 8, // 渲染器内边距
  },
});
