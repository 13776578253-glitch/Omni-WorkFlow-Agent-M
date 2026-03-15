// app/(main)/workflow.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { QuickActionNames, QuickActionPrompts, UserDataState } from '@/constants/type';
import type { WorkflowMode, WorkflowPressRecordingSession } from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';
                                                                                                   
import { WorkflowRecordingOverlay } from '@/components/ui/workflow-recording-overlay';
import { WorkflowContentArea } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions, type QuickActionKey } from '@/components/workflow/Workflow_QuickActions';
import { TOP_AREA_EXPANDED_HEIGHT, WorkflowTopArea } from '@/components/workflow/Workflow_Top_Area';

import {
  MARKDOWN_MOCK_DATA,
  WorkflowMessage
} from '@/components/workflow/Workflow_Context_bin/Workflow_Context_Data';
import { WorkflowStorage } from '@/services/workflow/Workflow_Storage';
import { createWorkflowUploadService } from '@/services/workflow/Workflow_Upload';

interface WorkflowScreenProps {
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

export default function WorkflowScreen({ setPagerScrollEnabled }: WorkflowScreenProps) {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [mode, setMode] = useState<WorkflowMode>('welcome');
  const [topAreaHeight, setTopAreaHeight] = useState(TOP_AREA_EXPANDED_HEIGHT);
  const [isAutoCompactLocked, setIsAutoCompactLocked] = useState(false);
  // 消息列表 / 测试
  const [messages, setMessages] = useState<WorkflowMessage[]>([]);

  const [quickActionNames, setQuickActionNames] = useState<QuickActionNames>(DEFAULT_QUICK_ACTION_NAMES);
  const [quickActionPrompts, setQuickActionPrompts] = useState<QuickActionPrompts>(DEFAULT_QUICK_ACTION_PROMPTS);
  // 快捷按钮状态 / UI 样式
  const [activeQuickActionKey, setActiveQuickActionKey] = useState<QuickActionKey | null>(null);
  
  const [isPressRecording, setIsPressRecording] = useState(false);
  const [isSlideCancelPreview, setIsSlideCancelPreview] = useState(false);
  // 波形动画 计时
  const [waveTick, setWaveTick] = useState(0);

  // 上传服务实例 / 测试
  const uploadServiceRef = useRef(createWorkflowUploadService());
  // 录音会话实例
  const recordingSessionRef = useRef<WorkflowPressRecordingSession | null>(null);
  // 录音启动中实例
  const startRecordingPendingRef = useRef(false);
  //待执行 释放操作 / 中间态
  const pendingReleaseActionRef = useRef<'send' | 'cancel' | null>(null);

  // 安全区域 信息
  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background');

  // Load initial messages
  useEffect(() => {
    const init = async () => {
      const stored = await WorkflowStorage.loadMessages();
      if (stored && stored.length > 0) {
        setMessages(stored);
        setMode('document'); // Assume document mode if history exists
      } else {
        // Optional: setMessages(DEFAULT_INITIAL_MESSAGES);
      }
    };
    init();
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      WorkflowStorage.saveMessages(messages);
    }
  }, [messages]);

  // Load Quick Actions
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

  // 页面聚焦
  useFocusEffect(
    useCallback(() => {
      void loadQuickActionNames();
    }, [loadQuickActionNames])
  );

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

  // Message Submission
  const handleSubmit = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const nextMode = detectModeFromInput(trimmed);
    if (mode === 'welcome') setMode(nextMode);

    // 1. Add User Message
    const userMsg: WorkflowMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    // 2. Add AI Mock Message (Cycled)
    // Derive index from current AI message count for strict ordering across reloads
    const aiMessageCount = messages.filter(m => m.role === 'ai').length;
    const mockData = MARKDOWN_MOCK_DATA[aiMessageCount % MARKDOWN_MOCK_DATA.length];
    
    const aiMsg: WorkflowMessage = {
      ...mockData,
      id: `ai-${Date.now()}`, // Unique ID
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputText('');
  }, [inputText, mode, messages]);

  const handleMessageUpdate = useCallback((id: string, newText: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, text: newText } : msg
    ));
  }, []);

  // Quick Action
  const handleQuickAction = useCallback((key: QuickActionKey) => {
    if (activeQuickActionKey === key) {
      setActiveQuickActionKey(null);
      return;
    }
    setActiveQuickActionKey(key);
    // Logic for quick action can be expanded here
  }, [activeQuickActionKey]);

  // Recording Logic (Simplified for refactor focus)
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
    
    // Simulate input submission with transcript
    setInputText(transcriptText);
    // Ideally, call handleSubmit directly or let user confirm
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

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        {/* 内容区 */}
        <WorkflowContentArea
          mode={mode}
          messages={messages}
          contentPaddingTop={mode === 'recording' ? topAreaHeight + TOP_AREA_OFFSET : undefined}
          onScrollOffsetChange={handleContentScroll}
          onMessageUpdate={handleMessageUpdate}
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
            {/* 快捷操作区  */}
            <View style={styles.quickActionsGap}>
              <WorkflowQuickActions
                onAction={handleQuickAction}
                quickActionNames={quickActionNames}
                quickActionPrompts={quickActionPrompts}
                activeKey={activeQuickActionKey}
              />
            </View>

            {/* 输入栏区 */}
            <WorkflowInputBar
              value={inputText}
              onChangeText={setInputText}
              onSubmit={handleSubmit}
              onPressInRecord={handleRecordPressIn}
              onPressOutRecord={handleRecordPressOut}
              onCancelRecord={handleRecordCancel}
              onSlideCancelStateChange={setIsSlideCancelPreview}
              isPressRecording={isPressRecording}
              containerStyle={{ marginTop: 4, marginBottom: inputBarMarginBottom }}
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
});
