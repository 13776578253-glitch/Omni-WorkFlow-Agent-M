// app/(main)/workflow.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { QuickActionNames, QuickActionPrompts, UserDataState } from '@/constants/type';
// tyye 类型待处理
import type { WorkflowAttachment, WorkflowBlock, WorkflowMode, WorkflowPressRecordingSession } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

import { WorkflowRecordingOverlay } from '@/components/ui/workflow-recording-overlay';
import { WorkflowContentArea, type WorkflowContentAreaRef } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions, type QuickActionKey } from '@/components/workflow/Workflow_QuickActions';
import { TOP_AREA_EXPANDED_HEIGHT, WorkflowTopArea } from '@/components/workflow/Workflow_Top_Area';
import { selectThoughtChain } from '@/components/workflow/Workflow_Context_bin/Workflow_Status_Reminder_Data';

// 待处理
import { MARKDOWN_MOCK_DATA } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_Data';
import { WorkflowStorage } from '@/services/workflow/Workflow_Storage';
import { createWorkflowUploadService } from '@/services/workflow/Workflow_Upload';
import { SessionManager } from '@/services/workflow/Session_Manager';
import * as HistoryStorage from '@/services/history/History_Storage';

interface WorkflowScreenProps {
  currentSessionId: string | null;
  onHistoryChanged: () => void;
  onSessionChange: (sessionId: string | null) => void;
  resetToken: number;
  setPagerScrollEnabled: (enabled: boolean) => void;
}

// 测试
type ActiveWorkflowMode = Exclude<WorkflowMode, 'welcome'>;
const RECORD_DOT_COUNT = 30;  // 波形振幅
const TOP_AREA_OFFSET = 100;

// 测试 / 存储键名
const USER_DATA_STORAGE_KEY = '@omni_workflow_user_data_v1';

// 快捷操作 默认 名称
const DEFAULT_QUICK_ACTION_NAMES: QuickActionNames = { 
// 快捷操作 默认 名称
  solt1: 'Preset 1', solt2: 'Preset 2', solt3: 'Preset 3', solt4: 'Preset 4',
};
// 快捷操作 默认 提示文本
const DEFAULT_QUICK_ACTION_PROMPTS: QuickActionPrompts = {
// 快捷操作 默认 提示文本
  solt1: '', solt2: '', solt3: '', solt4: '',
};

// 测试 / 工作流模式 检测切换
function detectModeFromInput(text: string): ActiveWorkflowMode {
  const value = text.toLowerCase();
  const recordingKeywords = ['录音', '语音', '音频', 'transcript', 'record'];
  return value.includes('1') || recordingKeywords.some((word) => value.includes(word)) ? 'recording' : 'document';
}

export default function WorkflowScreen({
  currentSessionId,
  onHistoryChanged,
  onSessionChange,
  resetToken,
  setPagerScrollEnabled,
}: WorkflowScreenProps) {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [mode, setMode] = useState<WorkflowMode>('welcome');
  const [topAreaHeight, setTopAreaHeight] = useState(TOP_AREA_EXPANDED_HEIGHT);
  const [isAutoCompactLocked, setIsAutoCompactLocked] = useState(false);

  // 测试
  // 块列表
  const [blocks, setBlocks] = useState<WorkflowBlock[]>([]);
  // 首问锁定状态
  const [firstQuestionLocked, setFirstQuestionLocked] = useState(false);

  const [quickActionNames, setQuickActionNames] = useState<QuickActionNames>(DEFAULT_QUICK_ACTION_NAMES);
  const [quickActionPrompts, setQuickActionPrompts] = useState<QuickActionPrompts>(DEFAULT_QUICK_ACTION_PROMPTS);
  // 快捷按钮状态 / UI 样式
  const [activeQuickActionKey, setActiveQuickActionKey] = useState<QuickActionKey | null>(null);

  const [isPressRecording, setIsPressRecording] = useState(false);
  const [isSlideCancelPreview, setIsSlideCancelPreview] = useState(false);
  // 波形动画 计时
  const [waveTick, setWaveTick] = useState(0);

  // 键盘与滚动状态
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  // 内容高度 / 用于滚动适配 / 待处理
  const [contentHeight, setContentHeight] = useState(0);

  // 附件状态
  const [pendingAttachments, setPendingAttachments] = useState<WorkflowAttachment[]>([]);

  // 上传服务实例 / 测试
  const uploadServiceRef = useRef(createWorkflowUploadService());
  // 录音会话实例
  const recordingSessionRef = useRef<WorkflowPressRecordingSession | null>(null);
  // 录音启动中实例
  const startRecordingPendingRef = useRef(false);
  //待执行 释放操作 / 中间态
  const pendingReleaseActionRef = useRef<'send' | 'cancel' | null>(null);
  // 内容区域引用
  const contentAreaRef = useRef<WorkflowContentAreaRef>(null);
  const isHydratingSessionRef = useRef(false);
  const loadedSessionIdRef = useRef<string | null>(currentSessionId);

  // 安全区域 信息
  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background');

  // 初始化已移除，改用 useFocusEffect 统一处理
  useEffect(() => {
    setBlocks([]);
    setMode('welcome');
    setInputText('');
    setPendingAttachments([]);
    setFirstQuestionLocked(false);
    setActiveQuickActionKey(null);
    setIsAutoCompactLocked(false);
    setScrollOffset(0);
  }, [resetToken]);

  // 加载用户数据（如快捷操作名称和提示） / 测试逻辑
  const loadQuickActionNames = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_DATA_STORAGE_KEY);
      if (!raw) {
        setQuickActionNames(DEFAULT_QUICK_ACTION_NAMES);
        setQuickActionPrompts(DEFAULT_QUICK_ACTION_PROMPTS);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<UserDataState>;
      setQuickActionNames({ ...DEFAULT_QUICK_ACTION_NAMES, ...parsed.quickActionNames });
      setQuickActionPrompts({ ...DEFAULT_QUICK_ACTION_PROMPTS, ...parsed.quickActionPrompts });
    } catch {
      setQuickActionNames(DEFAULT_QUICK_ACTION_NAMES);
      setQuickActionPrompts(DEFAULT_QUICK_ACTION_PROMPTS);
    }
  }, []);

  useEffect(() => {
    void loadQuickActionNames();
  }, [loadQuickActionNames]);

  useEffect(() => {
    const reloadSession = async () => {
      isHydratingSessionRef.current = true;
      if (currentSessionId) {
        const stored = await WorkflowStorage.loadMessages(currentSessionId);
        setBlocks(stored ?? []);
        setMode(stored && stored.length > 0 ? 'document' : 'welcome');
        loadedSessionIdRef.current = currentSessionId;
      } else {
        setBlocks([]);
        setMode('welcome');
        setInputText('');
        setPendingAttachments([]);
        setFirstQuestionLocked(false);
        setActiveQuickActionKey(null);
        setIsAutoCompactLocked(false);
        setScrollOffset(0);
        loadedSessionIdRef.current = null;
      }
      isHydratingSessionRef.current = false;
    };

    void reloadSession();
  }, [currentSessionId, resetToken]);

  // 保存消息变更 / 测试逻辑 / 待优化：节流、去重、增量保存等
  useEffect(() => {
    if (!currentSessionId || blocks.length === 0) return;
    if (isHydratingSessionRef.current) return;
    if (loadedSessionIdRef.current !== currentSessionId) return;

    const saveBlocks = async () => {
      await WorkflowStorage.saveMessages(blocks, currentSessionId);
      await HistoryStorage.saveWorkflowData(currentSessionId, blocks);
    };

    void saveBlocks();
  }, [blocks, currentSessionId]);

  // 键盘监听
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setPagerScrollEnabled(false);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setPagerScrollEnabled(true);
      setKeyboardHeight(0);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, [setPagerScrollEnabled]);

  // 实时检测输入内容以触发录音模式 / 测试逻辑 / 待处理
  useEffect(() => {
    if (inputText.includes('录音') && mode !== 'recording') {
      setMode('recording');
    }
  }, [inputText, mode]);

  // 录音 波形动画定时器 / 待测试 / 待复用 / 准备拆分逻辑
  useEffect(() => {
    if (!isPressRecording) return;
    const timer = setInterval(() => setWaveTick((p) => p + 1), 65);
    return () => clearInterval(timer);
  }, [isPressRecording]);

  // 输入框 底部边距 计算
  const inputBarMarginBottom = useMemo(() => {
    let margin = insets.bottom + 20;
    if (Platform.OS === 'android') {
      margin += Math.max(0, keyboardHeight - insets.bottom);
    }
    return margin;
  }, [insets.bottom, keyboardHeight]);

  const handleContentScroll = useCallback((offsetY: number) => {
    setScrollOffset(offsetY);
    if (mode !== 'recording') return;
    if (offsetY > 100) {
      if (!isAutoCompactLocked) setIsAutoCompactLocked(true);
      return;
    }
    if (isAutoCompactLocked && offsetY <= 100) {
      setIsAutoCompactLocked(false);
    }
  }, [isAutoCompactLocked, mode]);

  const recordingDots = useMemo(() => 
    Array.from({ length: RECORD_DOT_COUNT }).map((_, index) => {
      const centerIndex = (RECORD_DOT_COUNT - 1) / 2;
      const distanceRatio = Math.abs(index - centerIndex) / centerIndex;
      const envelope = Math.max(0.2, 1 - Math.pow(distanceRatio, 1.35));
      const oscillation = 0.5 + 0.5 * Math.sin(waveTick * 0.42 + index * 0.58);
      return {
        key: `dock-record-dot-${index}`,
        height: 5 + envelope * (4 + oscillation * 14),
        opacity: 0.45 + envelope * (0.2 + oscillation * 0.35),
      };
    }),
  [waveTick]);

  // 消息提交 事件 / 复杂逻辑
  const handleSubmit = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    const nextMode = detectModeFromInput(trimmed);
    if (mode === 'welcome') setMode(nextMode);

    // 1. Add User Message
    const userMsg: WorkflowBlock = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      attachments: pendingAttachments.length > 0 ? pendingAttachments.map(a => ({ ...a, uploadStatus: 'success' as const })) : undefined,
      createdAt: Date.now(),
    };

    // 2. Add AI Mock Message (Cycled)
    const aiMessageCount = blocks.filter(m => m.role === 'ai').length;
    const mockData = MARKDOWN_MOCK_DATA[aiMessageCount % MARKDOWN_MOCK_DATA.length];

    const thoughtChain = selectThoughtChain(trimmed);

    const aiMsg: WorkflowBlock = {
      ...mockData,
      id: `ai-${Date.now()}`,
      thoughtChain,
    } as WorkflowBlock;

    const nextBlocks = [...blocks, userMsg, aiMsg];

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      await SessionManager.setCurrentSessionId(sessionId);
      await HistoryStorage.addSession({
        id: sessionId,
        title: '未命名对话',
        createdAt: Date.now(),
        isPinned: false,
      });
      await WorkflowStorage.saveMessages(nextBlocks, sessionId);
      await HistoryStorage.saveWorkflowData(sessionId, nextBlocks);
      loadedSessionIdRef.current = sessionId;
      onSessionChange(sessionId);
      onHistoryChanged();
    }

    setBlocks(nextBlocks);
    setInputText('');
    setPendingAttachments([]);
  }, [blocks, currentSessionId, inputText, mode, onHistoryChanged, onSessionChange, pendingAttachments]);

  const handleMessageUpdate = useCallback((id: string, newContent: string) => {
    const blockIndex = blocks.findIndex(b => b.id === id);
    if (blockIndex === -1) return;

    const block = blocks[blockIndex];

    // 规则1: 编辑首块 / user 块
    if (blockIndex === 0 && block.role === 'user') {
      const updatedBlock = { ...block, content: newContent };
      setBlocks([updatedBlock]);
      // TODO: 触发重新生成
      return;
    }

    // 规则2: 编辑 AI 块
    if (block.role === 'ai') {
      const updatedBlock = { ...block, content: newContent, editedByUser: true };
      const newBlocks = [...blocks];
      newBlocks[blockIndex] = updatedBlock;
      setBlocks(newBlocks);

      // 检查是否需要锁定首问
      if (block.sourceBlockId === blocks[0]?.id) {
        setFirstQuestionLocked(true);
      }

      // TODO: 触发追加生成
      return;
    }

    // 规则3: 编辑非首块 / user 块
    if (block.role === 'user') {
      const updatedBlock = { ...block, content: newContent };
      const newBlocks = [...blocks];
      newBlocks[blockIndex] = updatedBlock;
      setBlocks(newBlocks);
    }
  }, [blocks]);

  // 快捷操作 事件
  const handleQuickAction = useCallback((key: QuickActionKey) => {
    if (activeQuickActionKey === key) {
      setActiveQuickActionKey(null);
      return;
    }
    setActiveQuickActionKey(key);
    // TODO: 根据 key 执行对应操作，如填充输入框、触发特定生成等
  }, [activeQuickActionKey]);

  // 录音相关 事件 
  const finalizePressRecord = useCallback(async (action: 'send' | 'cancel') => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(false);
    const current = recordingSessionRef.current;
    if (!current || current.phase !== 'recording') return;

    const stopped = await uploadServiceRef.current.stopPressRecording(current);
    recordingSessionRef.current = stopped;
    if (stopped.phase === 'error' || action === 'cancel') return;

    const pipelineResult = await uploadServiceRef.current.runPressToTalkPipeline(stopped);
    const transcriptText = pipelineResult.transcriptText.trim() || 'Mock transcript content.';
    
    // TODO: 直接提交或让用户确认 / 这里直接填充输入框，用户可修改后再提交
    setInputText(transcriptText);
    // 自动触发提交（可选） / 这里不自动提交，给用户修改空间
    // handleSubmit();
  }, []);

  const handleRecordPressIn = useCallback(async () => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(true);
    pendingReleaseActionRef.current = null;
    startRecordingPendingRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // 启动 录音
    const session = await uploadServiceRef.current.startPressRecording();
    recordingSessionRef.current = session;
    startRecordingPendingRef.current = false;

    if (session.phase !== 'recording') {
      setIsPressRecording(false);
      return;
    }

    if (pendingReleaseActionRef.current) {
      const action = pendingReleaseActionRef.current;
      pendingReleaseActionRef.current = null;
      await finalizePressRecord(action);
    }
  }, [finalizePressRecord]);

  // 录音按钮松开 事件 / 测试 / 待拆分
  const handleRecordPressOut = useCallback(async () => {
    if (startRecordingPendingRef.current) {
      pendingReleaseActionRef.current = 'send';
      return;
    }
    await finalizePressRecord('send');
  }, [finalizePressRecord]);

  // 取消录音 事件 / 待拆分
  const handleRecordCancel = useCallback(async () => {
    if (startRecordingPendingRef.current) {
      pendingReleaseActionRef.current = 'cancel';
      return;
    }
    await finalizePressRecord('cancel');
  }, [finalizePressRecord]);

  // 键盘显隐回调
  const handleKeyboardVisibleChange = useCallback((visible: boolean) => {
    setIsKeyboardVisible(visible);
  }, []);

  // 滚动到底部
  const handleScrollToBottom = useCallback(() => {
    contentAreaRef.current?.scrollToEnd();
  }, []);

  // 判断是否显示回到底部按钮
  const showScrollToBottom = isKeyboardVisible && scrollOffset > 50 && pendingAttachments.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        {/* 内容区 */}
        <WorkflowContentArea
          ref={contentAreaRef}
          mode={mode}
          messages={blocks}
          contentPaddingTop={mode === 'recording' ? topAreaHeight + TOP_AREA_OFFSET : undefined}
          onScrollOffsetChange={handleContentScroll}
          onBlockSave={handleMessageUpdate}
          firstQuestionLocked={firstQuestionLocked}
        />
        <View style={styles.topAreaDock}>
          <WorkflowTopArea
            mode={mode}
            onHeightChange={mode === 'recording' ? setTopAreaHeight : undefined}
            forcedCompact={mode === 'recording' && isAutoCompactLocked}
          />
        </View>

        {/* 操作区 */}
        <View style={[styles.bottomDock, { backgroundColor: bgColor }]}>
          {/* 非录音状态 区域 */}
          <View style={isPressRecording ? styles.bottomDockHiddenContent : undefined}>
            {/* 快捷操作区 / 呼出键盘后隐藏*/}
            {!isKeyboardVisible && (
              <View style={styles.quickActionsGap}>
                <WorkflowQuickActions
                  onAction={handleQuickAction}
                  quickActionNames={quickActionNames}
                  quickActionPrompts={quickActionPrompts}
                  activeKey={activeQuickActionKey}
                />
              </View>
            )}

            {/* 输入栏区 */}
            <WorkflowInputBar
              value={inputText}
              onChangeText={setInputText}
              onSubmit={handleSubmit}
              attachments={pendingAttachments}
              onAttachmentsChange={setPendingAttachments}
              onPressInRecord={handleRecordPressIn}
              onPressOutRecord={handleRecordPressOut}
              onCancelRecord={handleRecordCancel}
              onSlideCancelStateChange={setIsSlideCancelPreview}
              isPressRecording={isPressRecording}
              onKeyboardVisibleChange={handleKeyboardVisibleChange}
              containerStyle={{ marginTop: isKeyboardVisible ? 12 : 4, marginBottom: inputBarMarginBottom }}
            />
          </View>

          {/* 录音状态 区域 */}
          {isPressRecording ? (
            <WorkflowRecordingOverlay
              isSlideCancelPreview={isSlideCancelPreview}
              paddingBottom={inputBarMarginBottom + 34}
              dots={recordingDots}
            />
          ) : null}

        </View>

        {/* 滚动到底部按钮 */}
        {showScrollToBottom && (
          <TouchableOpacity
            // todo: 进一步适配不同输入栏高度和安全区域变化 / 上传文件后滚动按钮隐藏
            style={[styles.scrollToBottomButton, { bottom: inputBarMarginBottom + 122 }]}
            onPress={handleScrollToBottom}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-down" size={24} color="#000000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topAreaDock: {
    position: 'absolute',
    top: TOP_AREA_OFFSET,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  bottomDock: {
    paddingTop: 0,
    position: 'relative',
  },
  bottomDockHiddenContent: {
    opacity: 0,
  },
  quickActionsGap: {
    marginTop: 12,
    marginBottom: 4,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 178, // 适配输入栏宽度和边距
    width: 43,
    height: 43,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
