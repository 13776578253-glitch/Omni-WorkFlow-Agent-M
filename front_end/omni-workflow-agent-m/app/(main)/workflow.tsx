import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { WorkflowMode } from '@/constants/workflow_type';

import { useThemeColor } from '@/hooks/use-theme-color';

import { DEFAULT_WORKFLOW_MESSAGES, WorkflowContentArea, type WorkflowMessage } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions, type QuickActionKey } from '@/components/workflow/Workflow_QuickActions';

interface WorkflowScreenProps {
  setPagerScrollEnabled: (enabled: boolean) => void;
}

type ActiveWorkflowMode = Exclude<WorkflowMode, 'welcome'>;

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

  const insets = useSafeAreaInsets();
  const bgColor = useThemeColor({}, 'background');

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
      if (key === 'upload_audio') {
        switchToMode('recording');
        return;
      }
      switchToMode('document');
    },
    [switchToMode]
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        <WorkflowContentArea mode={mode} messages={messages} />

        <View style={[styles.bottomDock, { backgroundColor: bgColor }]}>
          <View pointerEvents="none" style={[styles.bottomMask, { backgroundColor: bgColor }]} />

          <WorkflowQuickActions onAction={handleQuickAction} />

          <WorkflowInputBar
            value={inputText}
            onChangeText={setInputText}
            onSubmit={handleSubmit}
            containerStyle={{ marginBottom: inputBarMarginBottom }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomMask: {
    height: 14,
    marginTop: -14,
    opacity: 0.55,
  },
  bottomDock: {
    paddingTop: 6,
  },
});
