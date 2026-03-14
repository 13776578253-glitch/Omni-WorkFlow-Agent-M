import { WorkflowMarkdownEditor } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Editor';
import { WorkflowMarkdownRenderer } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Renderer';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface WorkflowMessageItemProps {
  message: {
    id: string;
    role: 'user' | 'ai';
    text: string;
  };
  onUpdate: (id: string, newText: string) => void;
}

export function WorkflowMessageItem({ message, onUpdate }: WorkflowMessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isUser = message.role === 'user';

  // 容器标识器 颜色 / 待处理
  const aiIndicatorColor = useThemeColor({ light: '#60A5FA', dark: '#60A5FA' }, 'tint'); // Light Blue
  const userIndicatorColor = useThemeColor({ light: '#2DD4BF', dark: '#2DD4BF' }, 'tint'); // Teal/Blue-Green

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (newText: string) => {
    onUpdate(message.id, newText);
    setIsEditing(false);
  };

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
            initialContent={message.text} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        ) : (
          <TouchableOpacity onPress={handleEdit} activeOpacity={0.8} style={styles.rendererContainer}>
            <WorkflowMarkdownRenderer content={message.text} align={isUser ? 'right' : 'left'} />
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
    // maxWidth: '100%', // Removed to prevent forced stretching, will rely on flex behavior
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
