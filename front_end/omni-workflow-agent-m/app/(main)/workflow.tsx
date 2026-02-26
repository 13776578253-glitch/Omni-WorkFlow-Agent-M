// app/(main)/workflow.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { QuickActionNames, QuickActionPrompts, UserDataState } from '@/constants/type';
import type { WorkflowMode, WorkflowPressRecordingSession } from '@/constants/workflow_type';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_WORKFLOW_MESSAGES, WorkflowContentArea, type WorkflowMessage } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions, type QuickActionKey } from '@/components/workflow/Workflow_QuickActions';

import { createWorkflowUploadService } from '@/services/workflow/Workflow_Upload';

interface WorkflowScreenProps {
  setPagerScrollEnabled: (enabled: boolean) => void;
}

type ActiveWorkflowMode = Exclude<WorkflowMode, 'welcome'>;

// 测试
const USER_DATA_STORAGE_KEY = '@omni_workflow_user_data_v1';

const DEFAULT_QUICK_ACTION_NAMES: QuickActionNames = { 
  solt1: 'Preset 1',
  solt2: 'Preset 2',
  solt3: 'Preset 3',
  solt4: 'Preset 4',
};

const DEFAULT_QUICK_ACTION_PROMPTS: QuickActionPrompts = {
  solt1: '',
  solt2: '',
  solt3: '',
  solt4: '',
};

function detectModeFromInput(text: string): ActiveWorkflowMode {
  const value = text.toLowerCase();
  const recordingKeywords = ['录音', '语音', '音频', 'transcript', 'record'];
  return recordingKeywords.some((word) => value.includes(word)) ? 'recording' : 'document';
}

function buildMockMessages(mode: ActiveWorkflowMode, userText?: string): WorkflowMessage[] {
  const now = Date.now();
  const firstBatch: WorkflowMessage[] = userText
    ? [
        { id: `user-${now}`, role: 'user', text: userText },
        {
          id: `ai-${now}`,
          role: 'ai',
          text:
            mode === 'recording'
              ? '已识别到录音上下文，正在生成转写与结构化结果（mock）。'
              : '已收到文本/文档输入，正在生成结构化结果（mock）。',
        },
      ]
    : [];

  return [...firstBatch, ...DEFAULT_WORKFLOW_MESSAGES.slice(0, 12)];
}

export default function WorkflowScreen({ setPagerScrollEnabled }: WorkflowScreenProps) {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [mode, setMode] = useState<WorkflowMode>('welcome');
  const [messages, setMessages] = useState<WorkflowMessage[]>([]);
  const [quickActionNames, setQuickActionNames] = useState<QuickActionNames>(DEFAULT_QUICK_ACTION_NAMES);
  const [quickActionPrompts, setQuickActionPrompts] = useState<QuickActionPrompts>(DEFAULT_QUICK_ACTION_PROMPTS);
  const [isPressRecording, setIsPressRecording] = useState(false);
  const [isSlideCancelPreview, setIsSlideCancelPreview] = useState(false);
  const uploadServiceRef = useRef(createWorkflowUploadService());
  const recordingSessionRef = useRef<WorkflowPressRecordingSession | null>(null);

  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background');

  const loadQuickActionNames = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_DATA_STORAGE_KEY);
      if (!raw) {
        setQuickActionNames(DEFAULT_QUICK_ACTION_NAMES);
        setQuickActionPrompts(DEFAULT_QUICK_ACTION_PROMPTS);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<UserDataState>;
      const storedNames = parsed.quickActionNames ?? {};
      const storedPrompts = parsed.quickActionPrompts ?? {};
      setQuickActionNames({
        ...DEFAULT_QUICK_ACTION_NAMES,
        ...storedNames,
      });
      setQuickActionPrompts({
        ...DEFAULT_QUICK_ACTION_PROMPTS,
        ...storedPrompts,
      });
    } catch {
      setQuickActionNames(DEFAULT_QUICK_ACTION_NAMES);
      setQuickActionPrompts(DEFAULT_QUICK_ACTION_PROMPTS);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadQuickActionNames();
    }, [loadQuickActionNames])
  );

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setPagerScrollEnabled(false);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setPagerScrollEnabled(true);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [setPagerScrollEnabled]);

  const inputBarMarginBottom = useMemo(() => {
    let margin = insets.bottom + 20;
    if (Platform.OS === 'android') {
      margin += Math.max(0, keyboardHeight - insets.bottom);
    }
    return margin;
  }, [insets.bottom, keyboardHeight]);

  const switchToMode = useCallback((nextMode: ActiveWorkflowMode, userText?: string) => {
    setMode(nextMode);
    setMessages(buildMockMessages(nextMode, userText));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const nextMode = detectModeFromInput(trimmed);
    switchToMode(nextMode, trimmed);
    setInputText('');
  }, [inputText, switchToMode]);

  const handleQuickAction = useCallback(
    (key: QuickActionKey) => {
      const value = `${quickActionNames[key] ?? ''} ${quickActionPrompts[key] ?? ''}`.toLowerCase();
      const recordingKeywords = ['录音', '语音', '音频', 'transcript', 'record'];
      const nextMode: ActiveWorkflowMode = recordingKeywords.some((word) => value.includes(word)) ? 'recording' : 'document';
      switchToMode(nextMode);
    },
    [quickActionNames, quickActionPrompts, switchToMode]
  );

  const handleRecordPressIn = useCallback(async () => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(true);
    const session = await uploadServiceRef.current.startPressRecording();
    recordingSessionRef.current = session;

    if (session.phase !== 'recording') {
      setIsPressRecording(false);
      return;
    }
  }, []);

  const handleRecordPressOut = useCallback(async () => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(false);
    const current = recordingSessionRef.current;
    if (!current || current.phase !== 'recording') return;

    const stopped = await uploadServiceRef.current.stopPressRecording(current);
    recordingSessionRef.current = stopped;
    if (stopped.phase === 'error') return;

    const pipelineResult = await uploadServiceRef.current.runPressToTalkPipeline(stopped);
    recordingSessionRef.current = pipelineResult.session;

    const transcriptText = pipelineResult.transcriptText.trim() || 'Mock transcript content.';
    switchToMode('recording', transcriptText);
  }, [switchToMode]);

  const handleRecordCancel = useCallback(async () => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(false);
    const current = recordingSessionRef.current;
    if (!current || current.phase !== 'recording') return;

    const stopped = await uploadServiceRef.current.stopPressRecording(current);
    recordingSessionRef.current = stopped;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        {/*  */}
        <WorkflowContentArea mode={mode} messages={messages} />

        <View style={[styles.bottomDock, { backgroundColor: bgColor }]}>
          <View style={isPressRecording ? styles.bottomDockHiddenContent : undefined}>
            {/*  */}
            <View style={styles.quickActionsGap}>
              <WorkflowQuickActions
                onAction={handleQuickAction}
                quickActionNames={quickActionNames}
                quickActionPrompts={quickActionPrompts}
              />
            </View>

            {/*  */}
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

          {isPressRecording ? (
            <View pointerEvents="none" style={[styles.recordingDockOverlay, { paddingBottom: inputBarMarginBottom + 18 }]}>
              <Text style={styles.recordingHint}>
                {isSlideCancelPreview ? '松手取消发送' : '松手发送，上滑取消'}
              </Text>
              <View style={styles.recordingDotsRow}>
                {Array.from({ length: 42 }).map((_, index) => (
                  <View key={`dock-record-dot-${index}`} style={styles.recordingDot} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  recordingDockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59,130,246,0.10)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  recordingHint: {
    fontSize: 18,
    color: 'rgba(60,60,67,0.75)',
    marginBottom: 16,
  },
  recordingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  recordingDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
});

