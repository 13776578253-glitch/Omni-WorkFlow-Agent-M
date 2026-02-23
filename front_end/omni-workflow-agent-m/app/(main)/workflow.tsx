// app/(main)/workflow.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import type { QuickActionNames, QuickActionPrompts, UserDataState } from '@/constants/type';
import type { WorkflowMode } from '@/constants/workflow_type';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_WORKFLOW_MESSAGES, WorkflowContentArea, type WorkflowMessage } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions, type QuickActionKey } from '@/components/workflow/Workflow_QuickActions';

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

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        {/*  */}
        <WorkflowContentArea mode={mode} messages={messages} />

        <View style={[styles.bottomDock, { backgroundColor: bgColor }]}>
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
            containerStyle={{ marginTop: 4, marginBottom: inputBarMarginBottom }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomDock: {
    paddingTop: 0,
  },
  quickActionsGap: {
    marginTop: 12,
    marginBottom: 4,
  },
});
