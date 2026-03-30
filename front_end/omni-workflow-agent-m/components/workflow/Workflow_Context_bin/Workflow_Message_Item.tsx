import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { WorkflowMarkdownEditor } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Editor';
import { WorkflowMarkdownRenderer } from '@/components/workflow/Workflow_Context_bin/Workflow_Markdown_Renderer';
import { WorkflowStatusReminder } from './Workflow_Status_Reminder';

import type { WorkflowBlock } from '@/constants/workflow_type';
import { getAIStatusText, isAIBlock } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

// 角色头部组件
interface RoleHeaderProps {
  role: 'user' | 'ai';
  nickname?: string;
  status?: 'pending' | 'done' | 'error';
  textColor: string;
  iconColor: string;
}

// 头部信息 / 待修改同步昵称和状态显示
function RoleHeader({ role, nickname, status, textColor, iconColor }: RoleHeaderProps) {
  const isUser = role === 'user';
  const statusText = !isUser ? getAIStatusText(status) : '';

  return (
    <View style={[styles.roleHeader, isUser ? styles.roleHeaderRight : styles.roleHeaderLeft]}>
      {isUser ? (
        <>
          <Ionicons name="person-circle-outline" size={20} color={iconColor} />
          <Text style={[styles.roleText, { color: textColor }]}>{nickname || '用户'}</Text>
        </>
      ) : (
        <>
          <Ionicons name="sparkles" size={18} color={iconColor} />
          <Text style={[styles.roleText, { color: textColor }]}>Zhi Lian AI</Text>
          {statusText ? <Text style={[styles.statusText, { color: textColor }]}>{statusText}</Text> : null}
        </>
      )}
    </View>
  );
}

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
  // 待修改同步
  const userName = 'cpp'; 

  // 容器标识器 颜色 / 待处理
  const aiIndicatorColor = useThemeColor({ light: '#60A5FA', dark: '#60A5FA' }, 'tint');
  const userIndicatorColor = useThemeColor({ light: '#2DD4BF', dark: '#2DD4BF' }, 'tint');

  // 角色头部颜色 / 待处理
  const textColor = useThemeColor({}, 'text');
  const aiIconColor = useThemeColor({ light: '#60A5FA', dark: '#93C5FD' }, 'tint');
  const userIconColor = useThemeColor({ light: '#2DD4BF', dark: '#5EEAD4' }, 'tint');

  // 提取 AI 状态
  const status = isAIBlock(message) ? message.status : undefined; 

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
    <View style={styles.outerContainer}>
      {/* 头部信息 */}
      <View style={[styles.headerWrapper, isUser ? styles.headerWrapperRight : styles.headerWrapperLeft]}>
        <RoleHeader
          role={message.role}
          nickname={userName}
          status={status}
          textColor={textColor}
          iconColor={isUser ? userIconColor : aiIconColor}
        />
      </View>

      {/* 内容区域 / 边缘线 */}
      <View style={[styles.container, isUser ? styles.containerRight : styles.containerLeft]}>
        {/* AI 消息左侧标识 */}
        {!isUser && (
          <View style={[styles.indicatorBar, { backgroundColor: aiIndicatorColor, marginRight: 12 }]} />
        )}
        
        {/* 内容区域 */}
        <View style={[styles.contentWrapper, isUser ? { alignItems: 'flex-end' } : { width: '100%' }]}>
          {/* 思维链 */}
          {!isUser && 'thoughtChain' in message && message.thoughtChain && (
            <WorkflowStatusReminder thoughtChain={message.thoughtChain} />
          )}

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

          {/* 附件容器 */}
          {isUser && 'attachments' in message && message.attachments && message.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {message.attachments.map((att) => (
                <View key={att.id} style={styles.messageAttachmentItem}>
                  {att.type === 'image' ? (
                    <Image source={{ uri: att.thumbnailUri || att.localPath }} style={styles.messageAttachmentThumbnail} contentFit="cover" />
                  ) : (
                    <View style={styles.messageFileThumbnail}>
                      <Ionicons name="document-outline" size={32} color="#666" />
                      <Text style={styles.messageFileName} numberOfLines={1}>{att.fileName}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* 用户消息右侧标识 */}
        {isUser && (
          <View style={[styles.indicatorBar, { backgroundColor: userIndicatorColor, marginLeft: 12 }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
    width: '100%',
  },
  headerWrapper: {
    width: '100%',
    marginBottom: 4,
  },
  headerWrapperLeft: {
    paddingLeft: 16,
  },
  headerWrapperRight: {
    paddingRight: 16,
  },
  container: {
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
  // 角色头部样式
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 6,
  },
  roleHeaderLeft: {
    justifyContent: 'flex-start',
  },
  roleHeaderRight: {
    justifyContent: 'flex-end',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  messageAttachmentItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  messageAttachmentThumbnail: {
    width: '100%',
    height: '100%',
  },
  messageFileThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  messageFileName: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
});
