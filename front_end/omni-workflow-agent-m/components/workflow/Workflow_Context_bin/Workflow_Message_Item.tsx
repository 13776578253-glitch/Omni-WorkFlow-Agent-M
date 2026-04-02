import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  onPresentationStateChange?: (id: string, patch: Partial<WorkflowBlock>) => void;
  canEdit?: boolean;
}
      
export function WorkflowMessageItem({ message, onUpdate, onPresentationStateChange, canEdit = true }: WorkflowMessageItemProps) {
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
  // 思维链和消息动画状态，兼容旧数据逻辑：如果字段不存在，则默认认为动画已播放过
  const thoughtChainPlayed = isAIBlock(message) ? message.thoughtChainAnimationPlayed ?? true : true;
  const messageAnimationPlayed = isAIBlock(message) ? message.messageAnimationPlayed ?? true : true;
  const hasThoughtChain = !isUser && 'thoughtChain' in message && !!message.thoughtChain;
  // 思维链动画状态
  const [shouldAnimateThoughtChain, setShouldAnimateThoughtChain] = useState(!isUser && !thoughtChainPlayed);
  const [shouldAnimateMessage, setShouldAnimateMessage] = useState(!isUser && !messageAnimationPlayed);
  const [canRevealMessage, setCanRevealMessage] = useState(
    isUser || message.editedByUser === true || !shouldAnimateMessage || !hasThoughtChain
  );
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageStartReportedRef = useRef(false);

  // 思维链动画处理
  useEffect(() => {
    const nextShouldAnimateThoughtChain = !isUser && !thoughtChainPlayed && message.editedByUser !== true;
    const nextShouldAnimateMessage = !isUser && !messageAnimationPlayed && message.editedByUser !== true;

    setShouldAnimateThoughtChain(nextShouldAnimateThoughtChain);
    setShouldAnimateMessage(nextShouldAnimateMessage);
    setCanRevealMessage(
      isUser || message.editedByUser === true || !nextShouldAnimateMessage || !hasThoughtChain
    );
    messageStartReportedRef.current = false;
  }, [hasThoughtChain, isUser, message.editedByUser, message.id]);

  // 编辑处理 首问锁定时禁止编辑
  const handleEdit = () => {
    if (!canEdit) {
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

  // 思维链动画效果
  useEffect(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    messageStartReportedRef.current = false;

    if (isUser || message.editedByUser === true) {
      setCanRevealMessage(true);
      return;
    }

    if (!isAIBlock(message)) {
      setCanRevealMessage(true);
      return;
    }

    if (!shouldAnimateMessage) {
      setCanRevealMessage(true);
      return () => {
        if (revealTimerRef.current) {
          clearTimeout(revealTimerRef.current);
          revealTimerRef.current = null;
        }
      };
    }

    if (!hasThoughtChain || !shouldAnimateThoughtChain) {
      revealTimerRef.current = setTimeout(() => {
        setCanRevealMessage(true);
      }, 1000);
      return () => {
        if (revealTimerRef.current) {
          clearTimeout(revealTimerRef.current);
          revealTimerRef.current = null;
        }
      };
    }

    setCanRevealMessage(false);

    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [hasThoughtChain, isUser, message.editedByUser, message.id, shouldAnimateMessage, shouldAnimateThoughtChain]);

  const handleThoughtChainAnimationStart = useCallback(() => {
    if (isUser || !shouldAnimateThoughtChain) return;
    onPresentationStateChange?.(message.id, { thoughtChainAnimationPlayed: true });
  }, [isUser, message.id, onPresentationStateChange, shouldAnimateThoughtChain]);

  const handleThoughtChainComplete = useCallback(() => {
    if (!shouldAnimateMessage) {
      setCanRevealMessage(true);
      return;
    }

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = setTimeout(() => {
      setCanRevealMessage(true);
    }, 1000);
  }, [shouldAnimateMessage]);

  // 消息动画开始回调
  const handleMessageAnimationStart = useCallback(() => {
    if (isUser || !shouldAnimateMessage || messageStartReportedRef.current) return;
    messageStartReportedRef.current = true;
    onPresentationStateChange?.(message.id, { messageAnimationPlayed: true });
  }, [isUser, message.id, onPresentationStateChange, shouldAnimateMessage]);

  // 逐字显示文本组件
  type MarkdownAlign = 'left' | 'right';

  interface ProgressiveMarkdownMessageProps {
    content: string;
    align: MarkdownAlign;
    textColor: string;
    onAnimationStart?: () => void;
  }

  function ProgressiveMarkdownMessage({ content, align, textColor, onAnimationStart }: ProgressiveMarkdownMessageProps) {
    const blocks = useMemo(() => splitMarkdownBlocks(content), [content]);
    const [visibleBlockCount, setVisibleBlockCount] = useState(0);
    const [activeText, setActiveText] = useState('');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const startedRef = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
      mountedRef.current = true;

      if (!startedRef.current) {
        startedRef.current = true;
        onAnimationStart?.();
      }

      if (blocks.length === 0) {
        setVisibleBlockCount(0);
        setActiveIndex(null);
        setActiveText('');
        return () => {
          mountedRef.current = false;
        };
      }

      let timer: ReturnType<typeof setTimeout> | null = null;
      let charTimer: ReturnType<typeof setInterval> | null = null;

      // 递归显示块内容，段落块逐字显示，其他块直接显示
      const revealNextBlock = (index: number) => {
        if (!mountedRef.current || index >= blocks.length) {
          setActiveIndex(null);
          setActiveText('');
          return;
        }

        const block = blocks[index];

        if (block.type === 'paragraph') {
          setActiveIndex(index);
          setActiveText('');
          let cursor = 0;
          charTimer = setInterval(() => {
            cursor += 1;
            if (!mountedRef.current) return;

            setActiveText(block.content.slice(0, cursor));
            if (cursor >= block.content.length) {
              if (charTimer) {
                clearInterval(charTimer);
                charTimer = null;
              }
              setVisibleBlockCount(index + 1);
              setActiveIndex(null);
              timer = setTimeout(() => revealNextBlock(index + 1), 180);
            }
          }, 28);
          return;
        }

        setVisibleBlockCount(index + 1);
        setActiveIndex(null);
        setActiveText('');
        timer = setTimeout(() => revealNextBlock(index + 1), 220);
      };

      revealNextBlock(0);

      return () => {
        mountedRef.current = false;
        if (timer) clearTimeout(timer);
        if (charTimer) clearInterval(charTimer);
      };
    }, [blocks, onAnimationStart]);

    const visibleMarkdown = blocks.slice(0, visibleBlockCount).map((block) => block.content).join('\n\n');
    const activeBlock = activeIndex !== null ? blocks[activeIndex] : null;

    return (
      <View>
        {visibleMarkdown ? <WorkflowMarkdownRenderer content={visibleMarkdown} align={align} /> : null}
        {activeBlock?.type === 'paragraph' && activeText ? (
          <AnimatedTypewriterText text={activeText} textColor={textColor} align={align} />
        ) : null}
      </View>
    );
  }

  // 思维链组件
  function AnimatedTypewriterText({ text, textColor, align }: { text: string; textColor: string; align: MarkdownAlign }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.progressiveParagraph, { color: textColor, textAlign: align }]}>{text}</Text>
      </Animated.View>
    );
  }

  interface MarkdownBlockChunk {
    type: 'paragraph' | 'heading' | 'list' | 'blockquote' | 'code' | 'other';
    content: string;
  }

  function splitMarkdownBlocks(content: string): MarkdownBlockChunk[] {
    const lines = content.split('\n');
    const blocks: MarkdownBlockChunk[] = [];
    let buffer: string[] = [];
    let inCodeFence = false;

    const flushBuffer = () => {
      if (buffer.length === 0) return;
      const text = buffer.join('\n').trim();
      buffer = [];
      if (!text) return;
      blocks.push({
        type: detectMarkdownBlockType(text),
        content: text,
      });
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      const isFenceLine = trimmed.startsWith('```');

      if (isFenceLine) {
        if (inCodeFence) {
          buffer.push(line);
          inCodeFence = false;
          flushBuffer();
        } else {
          flushBuffer();
          buffer = [line];
          inCodeFence = true;
        }
        return;
      }

      if (inCodeFence) {
        buffer.push(line);
        return;
      }

      if (trimmed === '') {
        flushBuffer();
        return;
      }

      const lineType = detectMarkdownLineType(trimmed);
      const currentType = buffer.length > 0 ? detectMarkdownLineType(buffer[0].trim()) : null;
      const shouldStartNewBlock =
        buffer.length > 0 &&
        ((lineType !== currentType && (lineType === 'heading' || currentType === 'heading')) ||
          (currentType !== 'list' && lineType === 'list') ||
          (currentType !== 'blockquote' && lineType === 'blockquote'));

      if (shouldStartNewBlock) {
        flushBuffer();
      }

      buffer.push(line);
    });

    flushBuffer();
    return blocks;
  }

  // 测试用例：逐字显示文本组件
  // 已定位 4 个核心章节：项目背景、技术选型、开发进度、后续计划。
  function detectMarkdownLineType(line: string): MarkdownBlockChunk['type'] | null {
    if (!line) return null;
    if (line.startsWith('```')) return 'code';
    if (/^#{1,6}\s/.test(line)) return 'heading';
    if (/^>\s?/.test(line)) return 'blockquote';
    if (/^([-*+]|\d+\.)\s/.test(line)) return 'list';
    return 'paragraph';
  }

  function detectMarkdownBlockType(text: string): MarkdownBlockChunk['type'] {
    const firstLine = text.split('\n')[0]?.trim() ?? '';
    return detectMarkdownLineType(firstLine) ?? 'other';
  }

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
            <WorkflowStatusReminder
              thoughtChain={message.thoughtChain}
              hasPlayed={!shouldAnimateThoughtChain}
              onAnimationStart={handleThoughtChainAnimationStart}
              onComplete={handleThoughtChainComplete}
            />
          )}

          {isEditing ? (
            <WorkflowMarkdownEditor
              initialContent={message.content}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <TouchableOpacity onPress={handleEdit} activeOpacity={0.8} style={styles.rendererContainer}>
              {isUser || !shouldAnimateMessage ? (
                <WorkflowMarkdownRenderer content={message.content} align={isUser ? 'right' : 'left'} />
              ) : canRevealMessage ? (
                <ProgressiveMarkdownMessage
                  content={message.content}
                  align={isUser ? 'right' : 'left'}
                  textColor={textColor}
                  onAnimationStart={handleMessageAnimationStart}
                />
              ) : null}
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
  progressiveParagraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
});

