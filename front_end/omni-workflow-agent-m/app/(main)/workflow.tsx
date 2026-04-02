// app/(main)/workflow.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { QuickActionNames, QuickActionPrompts, UserDataState } from '@/constants/type';
// tyye 类型待处理
import type {
  WorkflowAttachment,
  WorkflowBlock,
  WorkflowMode,
  WorkflowRecordedAudioPreview,
  WorkflowRecordingSession,
} from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';

import { WorkflowRecordingOverlay } from '@/components/ui/workflow-recording-overlay';
import { WorkflowContentArea, type WorkflowContentAreaRef } from '@/components/workflow/Workflow_ContentArea';
import { selectThoughtChain } from '@/components/workflow/Workflow_Context_bin/Workflow_Status_Reminder_Data';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions, type QuickActionKey } from '@/components/workflow/Workflow_QuickActions';
import { TOP_AREA_EXPANDED_HEIGHT, WorkflowTopArea } from '@/components/workflow/Workflow_Top_Area';

// 待处理
import { MARKDOWN_MOCK_DATA } from '@/components/workflow/Workflow_Context_bin/Workflow_Context_Data';
import * as HistoryStorage from '@/services/history/History_Storage';
import { SessionManager } from '@/services/workflow/Session_Manager';
import { WorkflowStorage } from '@/services/workflow/Workflow_Storage';
import { createWorkflowUploadService } from '@/services/workflow/Workflow_Upload';

interface WorkflowScreenProps {
  currentSessionId: string | null;
  onHistoryChanged: () => void;
  onSessionChange: (sessionId: string | null) => void;
  resetToken: number;
  setPagerScrollEnabled: (enabled: boolean) => void;
  pendingExternalInput?: string | null;
  pendingExternalSubmitToken?: number;
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
  pendingExternalInput,
  pendingExternalSubmitToken = 0,
}: WorkflowScreenProps) {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [mode, setMode] = useState<WorkflowMode>('welcome');
  const [topAreaHeight, setTopAreaHeight] = useState(TOP_AREA_EXPANDED_HEIGHT);
  const [isAutoCompactLocked, setIsAutoCompactLocked] = useState(false);
  const [recordedAudioPreview, setRecordedAudioPreview] = useState<WorkflowRecordedAudioPreview | null>(null);

  // 测试
  // 块列表
  const [blocks, setBlocks] = useState<WorkflowBlock[]>([]);

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
  const recordingSessionRef = useRef<WorkflowRecordingSession | null>(null);
  // 录音启动中实例
  const startRecordingPendingRef = useRef(false);
  //待执行 释放操作 / 中间态
  const pendingReleaseActionRef = useRef<'send' | 'cancel' | null>(null);
  // 内容区域引用
  const contentAreaRef = useRef<WorkflowContentAreaRef>(null);
  const isHydratingSessionRef = useRef(false);
  const loadedSessionIdRef = useRef<string | null>(currentSessionId);
  const handledExternalSubmitTokenRef = useRef(0);

  // 安全区域 信息
  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background');

  // 初始化已移除，改用 useFocusEffect 统一处理
  useEffect(() => {
    setBlocks([]);
    setMode('welcome');
    setInputText('');
    setPendingAttachments([]);
    setActiveQuickActionKey(null);
    setIsAutoCompactLocked(false);
    setRecordedAudioPreview(null);
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

  // 测试 / 快捷操作名称加载
  useEffect(() => {
    void loadQuickActionNames();
  }, [loadQuickActionNames]);
  
  // 加载会话数据 / 测试逻辑 / 待优化：节流、去重、增量加载等
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
        setActiveQuickActionKey(null);
        setIsAutoCompactLocked(false);
        setRecordedAudioPreview(null);
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

  // 测试 / 录音波形数据计算 / 待处理：实际音频数据、性能优化、样式调整等
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

  // 测试 / 可编辑用户块 ID 计算 / 待处理：编辑权限、首问锁定规则等
  const editableUserBlockId = useMemo(() => {
    for (let i = blocks.length - 1; i >= 0; i -= 1) {
      if (blocks[i]?.role === 'user') {
        return blocks[i].id;
      }
    }
    return null;
  }, [blocks]);

  // 测试 / 构建 AI 块（使用循环的 mock 数据和简单的思维链选择逻辑） / 待处理：实际生成内容、思维链构建规则、性能优化等
  const buildMockAIBlock = useCallback((userContent: string, sourceBlockId: string, aiSequenceIndex: number): WorkflowBlock => {
    const mockData = MARKDOWN_MOCK_DATA[aiSequenceIndex % MARKDOWN_MOCK_DATA.length];
    const thoughtChain = selectThoughtChain(userContent.trim());

    return {
      ...mockData,
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sourceBlockId,
      thoughtChain,
      thoughtChainAnimationPlayed: false,
      messageAnimationPlayed: false,
      editedByUser: false,
    } as WorkflowBlock;
  }, []);

  const submitWorkflowInput = useCallback(async (rawText: string, submitAttachments: WorkflowAttachment[] = []) => {
    const trimmed = rawText.trim();
    if (!trimmed && submitAttachments.length === 0) return;
    const nextMode = detectModeFromInput(trimmed);
    if (mode === 'welcome') setMode(nextMode);

    const userMsg: WorkflowBlock = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      attachments: submitAttachments.length > 0 ? submitAttachments.map(a => ({ ...a, uploadStatus: 'success' as const })) : undefined,
      createdAt: Date.now(),
    };

    const aiMessageCount = blocks.filter(m => m.role === 'ai').length;
    const aiMsg = buildMockAIBlock(trimmed, userMsg.id, aiMessageCount);

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
  }, [blocks, buildMockAIBlock, currentSessionId, mode, onHistoryChanged, onSessionChange]);

  const hasRecordedAudioPreview = mode === 'recording' && !!recordedAudioPreview?.audioUri;
  const hasRecordingTopArea = mode === 'recording';

  // 消息提交 事件 / 复杂逻辑
  const handleSubmit = useCallback(async () => {
    await submitWorkflowInput(inputText, pendingAttachments);
  }, [inputText, pendingAttachments, submitWorkflowInput]);

  useEffect(() => {
    if (!pendingExternalInput || pendingExternalSubmitToken <= 0) {
      return;
    }
    if (handledExternalSubmitTokenRef.current === pendingExternalSubmitToken) {
      return;
    }

    handledExternalSubmitTokenRef.current = pendingExternalSubmitToken;
    setInputText(pendingExternalInput);
    void submitWorkflowInput(pendingExternalInput, []);
  }, [pendingExternalInput, pendingExternalSubmitToken, submitWorkflowInput]);

  // 消息编辑 事件 / 编辑权限、生成触发、首问锁定规则等
  const handleMessageUpdate = useCallback((id: string, newContent: string) => {
    const blockIndex = blocks.findIndex(b => b.id === id);
    if (blockIndex === -1) return;

    const block = blocks[blockIndex];

    // 编辑 AI 块
    if (block.role === 'ai') {
      const updatedBlock = {
        ...block,
        content: newContent,
        editedByUser: true,
        thoughtChainAnimationPlayed: true,
        messageAnimationPlayed: true,
      };
      const newBlocks = [...blocks];
      newBlocks[blockIndex] = updatedBlock;
      setBlocks(newBlocks);
      return;
    }

    // 编辑用户块（仅限最后一个） / 编辑后替换当前轮 AI 结果
    if (block.role === 'user') {
      if (block.id !== editableUserBlockId) {
        return;
      }

      const updatedUserBlock: WorkflowBlock = {
        ...block,
        content: newContent,
        editedByUser: true,
        attachments: block.attachments,
        fileRef: block.fileRef,
      };

      const linkedAiIndex = blocks.findIndex(
        (candidate, index) => index > blockIndex && candidate.role === 'ai' && candidate.sourceBlockId === block.id
      );

      const aiSequenceIndex = linkedAiIndex >= 0
        ? Math.max(0, blocks.slice(0, linkedAiIndex + 1).filter((candidate) => candidate.role === 'ai').length - 1)
        : blocks.filter((candidate) => candidate.role === 'ai').length;

      const regeneratedAIBlock = buildMockAIBlock(newContent, block.id, aiSequenceIndex);
      const nextBlocks = [...blocks];
      nextBlocks[blockIndex] = updatedUserBlock;

      if (linkedAiIndex >= 0) {
        nextBlocks.splice(linkedAiIndex, 1, regeneratedAIBlock);
      } else {
        nextBlocks.splice(blockIndex + 1, 0, regeneratedAIBlock);
      }

      setBlocks(nextBlocks);
    }
  }, [blocks, buildMockAIBlock, editableUserBlockId]);

  // 演示状态变更 事件 / 待处理：实际生成状态、错误处理、动画控制等
  const handlePresentationStateChange = useCallback((id: string, patch: Partial<WorkflowBlock>) => {
    setBlocks((prev) => {
      let changed = false;

      const next = prev.map((block) => {
        if (block.id !== id) {
          return block;
        }

        const merged = { ...block, ...patch } as WorkflowBlock;
        const hasDiff = Object.keys(patch).some((key) => (block as any)[key] !== (merged as any)[key]);
        if (hasDiff) {
          changed = true;
          return merged;
        }
        return block;
      });

      return changed ? next : prev;
    });
  }, []);

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
    const fallbackTranscript = '请把这段按住说话的内容整理成结构化任务清单，并继续生成后续结果。';
    setIsSlideCancelPreview(false);
    setIsPressRecording(false);
    const current = recordingSessionRef.current;
    if (!current || current.phase !== 'recording') {
      if (action === 'send') {
        setInputText(fallbackTranscript);
      }
      recordingSessionRef.current = null;
      return;
    }

    const stopped = await uploadServiceRef.current.stopPressRecording(current);
    recordingSessionRef.current = stopped;
    if (action === 'cancel') {
      recordingSessionRef.current = null;
      return;
    }
    if (stopped.phase === 'error') {
      setInputText(fallbackTranscript);
      recordingSessionRef.current = null;
      return;
    }

    const pipelineResult = await uploadServiceRef.current.runPressToTalkPipeline(stopped, {
      source: 'workflow-press',
      strategy: 'mock_only',
    });
    const transcriptText = pipelineResult.transcriptText.trim() || fallbackTranscript;
    
    // TODO: 直接提交或让用户确认 / 这里直接填充输入框，用户可修改后再提交
    setInputText(transcriptText);
    recordingSessionRef.current = null;
    // 自动触发提交（可选） / 这里不自动提交，给用户修改空间
    // handleSubmit();
  }, []);

  // 录音按钮按下 事件 / 待拆分
  const handleRecordPressIn = useCallback(async () => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(true);
    pendingReleaseActionRef.current = null;
    startRecordingPendingRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // 启动 录音
    const session = await uploadServiceRef.current.startPressRecording('press-to-talk', 'workflow-press');
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

  const handleLongRecordAudioReady = useCallback((audio: WorkflowRecordedAudioPreview) => {
    setRecordedAudioPreview(audio);
    setMode('recording');
  }, []);

  const handleLongRecordComplete = useCallback((transcriptText: string) => {
    setInputText(transcriptText);
    setMode('recording');
  }, []);

  const handleClearRecordedAudioPreview = useCallback(() => {
    setRecordedAudioPreview(null);
    setInputText('');
    setMode(blocks.length > 0 ? 'document' : 'welcome');
  }, [blocks.length]);

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
          contentPaddingTop={hasRecordingTopArea ? topAreaHeight + TOP_AREA_OFFSET : undefined}
          onScrollOffsetChange={handleContentScroll}
          onBlockSave={handleMessageUpdate}
          editableUserBlockId={editableUserBlockId}
          // 待处理 / 测试
          onPresentationStateChange={handlePresentationStateChange}
        />
        <View style={styles.topAreaDock}>
          <WorkflowTopArea
            mode={mode}
            onHeightChange={hasRecordingTopArea ? setTopAreaHeight : undefined}
            forcedCompact={hasRecordingTopArea && isAutoCompactLocked}
            audioUri={recordedAudioPreview?.audioUri}
            audioDurationMs={recordedAudioPreview?.durationMs}
            hasPlayableAudio={hasRecordedAudioPreview}
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
              onLongRecordComplete={handleLongRecordComplete}
              onLongRecordAudioReady={handleLongRecordAudioReady}
              hasRecordedAudioPreview={hasRecordedAudioPreview}
              onClearRecordedAudioPreview={handleClearRecordedAudioPreview}
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
            // 适配不同输入栏高度和安全区域变化 / 上传文件后滚动按钮隐藏
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
