import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { KeyboardAwareScroll } from '@/components/user/personal/Keyboard_Aware_Scroll';
import { QuickActionFoldCard } from '@/components/user/personal/Quick_Action_FoldCard';
import { SettingItem } from '@/components/user/Setting_Item';
import { SettingSection } from '@/components/user/Setting_section';
// import { QUICK_ACTIONS } from '@/components/workflow/Workflow_QuickActions';


import type { PresetMode, QuickActionNames, QuickActionPrompts, UserDataState } from '@/constants/type';

import { useThemeColor } from '@/hooks/use-theme-color';

// 测试 / 后端对接
const STORAGE_KEY = '@omni_workflow_user_data_v1';

// 字数限制
const MAX_PROMPT_LENGTH = 200;
const MAX_QUICK_PROMPT_LENGTH = 50;
const MAX_MEMORY_CONTENT_LENGTH = 500;

// 有效字数 统计
function countPromptUnits(text: string): number {
  const chineseCount = (text.match(/[\u4E00-\u9FFF]/g) ?? []).length;
  const englishWordCount = (text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? []).length;
  return chineseCount + englishWordCount;
}

function isPromptOverLimit(text: string, limit: number): boolean {
  return countPromptUnits(text) > limit;
}

// 预设内容 / 待拆分
const DEFAULT_STATE: UserDataState = {
  presetMode: 'custom',
  presetPrompts: {
    custom: '',
    concise: '请输出简洁版本，先结论后要点，尽量控制在 3-5 条。',
    formal: '请使用正式、专业、可复用的表达，输出分段清晰的结果。',
  },
  // 测试内容 / 逻辑待确认
  quickActionNames: {
    solt1: '',
    solt2: '',
    solt3: '',
    solt4: '',
  },
  quickActionPrompts: {
    solt1: '',
    solt2: '',
    solt3: '',
    solt4: '',
  },
  // memoryPrompt: '以下是我的长期偏好，请在后续对话中尽量遵循：',
  memoryContent: '偏好中文输出；先总结结论，再给执行步骤；尽量结构化。',
};

const PRESET_OPTIONS: { label: string; value: PresetMode }[] = [
  { label: '自定义', value: 'custom' },
  { label: '简洁', value: 'concise' },
  { label: '正式', value: 'formal' },
];

export default function UserDataScreen() {
  const backgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000' }, 'background');
  const cardColor = useThemeColor({ light: '#FFF', dark: '#1C1C1E' }, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [state, setState] = useState<UserDataState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  
  // 展开 / 待修改
  const [expandedQuickActions, setExpandedQuickActions] = useState<Record<keyof QuickActionPrompts, boolean>>({
    solt1: false,
    solt2: false,
    solt3: false,
    solt4: false,
  });

  // 测试 / 后端对接 / 生命周期处理
  useEffect(() => {
    const loadState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<UserDataState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            presetPrompts: { ...prev.presetPrompts, ...(parsed.presetPrompts ?? {}) },
            quickActionNames: { ...prev.quickActionNames, ...(parsed.quickActionNames ?? {}) },
            quickActionPrompts: { ...prev.quickActionPrompts, ...(parsed.quickActionPrompts ?? {}) },
          }));
        }
      } catch {
        Alert.alert('提示', '个性化数据读取失败，已使用默认配置。');
      } finally {
        setLoaded(true);
      }
    };

    loadState();
  }, []);

  // 预设指令 更新
  const setPresetPrompt = useCallback((mode: PresetMode, value: string) => {
    setState((prev) => ({
      ...prev,
      presetPrompts: {
        ...prev.presetPrompts,
        [mode]: value,
      },
    }));
  }, []);

  // 快捷指令 标题 更新
  const setQuickName = useCallback((key: keyof QuickActionNames, value: string) => {
    setState((prev) => ({
      ...prev,
      quickActionNames: {
        ...prev.quickActionNames,
        [key]: value,
      },
    }));
  }, []);

  // 快捷指令 Promote 更新
  const setQuickPrompt = useCallback((key: keyof QuickActionPrompts, value: string) => {
    if (countPromptUnits(value) > MAX_QUICK_PROMPT_LENGTH) return;
    setState((prev) => ({
      ...prev,
      quickActionPrompts: {
        ...prev.quickActionPrompts,
        [key]: value,
      },
    }));
  }, []);

  // 快捷指令 清空
  const handleDeleteQuick = useCallback((key: keyof QuickActionPrompts) => {
    setState((prev) => ({
      ...prev,
      quickActionNames: {
        ...prev.quickActionNames,
        [key]: '',
      },
      quickActionPrompts: {
        ...prev.quickActionPrompts,
        [key]: '',
      },
    }));
  }, []);

  // 快捷指令 卡片 /展开/收起
  const toggleQuickAction = useCallback((key: keyof QuickActionPrompts) => {
    setExpandedQuickActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // 快捷指令 配置
  const quickActionConfig = useMemo(
    () => [
      { key: 'solt1' as const, defaultLabel: '预设快捷位 1' },
      { key: 'solt2' as const, defaultLabel: '预设快捷位 2' },
      { key: 'solt3' as const, defaultLabel: '预设快捷位 3' },
      { key: 'solt4' as const, defaultLabel: '预设快捷位 4' },
    ],
    []
  );

  // 保存
  const handleSave = useCallback(async () => {
    const hasPresetOverflow = Object.values(state.presetPrompts).some((text) => isPromptOverLimit(text, MAX_PROMPT_LENGTH));
    const hasQuickOverflow = Object.values(state.quickActionPrompts).some((text) =>
      isPromptOverLimit(text, MAX_QUICK_PROMPT_LENGTH)
    );
    const hasMemoryOverflow = isPromptOverLimit(state.memoryContent, MAX_MEMORY_CONTENT_LENGTH);

    if (hasPresetOverflow || hasQuickOverflow || hasMemoryOverflow) {
      Alert.alert('保存失败', `字数超上限，请先调整后再保存。`);
      return;
    }

    try {
      // 测试
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      Alert.alert('已保存', '个性化设置已更新。');
    } catch {
      Alert.alert('保存失败', '请稍后重试。');
    }
  }, [state]);

  // 当前激活 指令/字数
  const activePresetPrompt = state.presetPrompts[state.presetMode];
  const activePresetLength = countPromptUnits(activePresetPrompt);
  const memoryContentLength = countPromptUnits(state.memoryContent);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* 键盘聚焦 处理 */}
      <KeyboardAwareScroll contentContainerStyle={styles.content}>
        {({ onInputFocus }) => (
          <>

        {/* 预设 */}
        <View style={styles.sectionCompact}>
          <SettingSection title="预设">
            {PRESET_OPTIONS.map((item) => (
              <SettingItem
                key={item.value}
                title={item.label}
                hasArrow={false}
                selected={state.presetMode === item.value}
                onPress={() => setState((prev) => ({ ...prev, presetMode: item.value }))}
              />
            ))}
          </SettingSection>
        </View>

        {/* 指令 */}
        <View style={[styles.sectionCompact, styles.presetInstructionLinked]}>
          <SettingSection title="指令">
            <View style={[styles.editorCard, { backgroundColor: cardColor }]}>
              {/* <ThemedText style={styles.editorTitle}>当前模式指令</ThemedText> */}
              <TextInput
                value={activePresetPrompt}
                onChangeText={(value) => setPresetPrompt(state.presetMode, value)}
                onFocus={onInputFocus}   // 聚焦
                multiline
                style={[styles.multilineInput, { color: textColor }]}
                placeholder="为当前模式填写专属指令"
                placeholderTextColor={textColor + '66'}
              />
              {/* 字数统计 */}
              <View style={styles.lengthDetector}>
                <ThemedText style={[styles.lengthText, activePresetLength > MAX_PROMPT_LENGTH && styles.lengthTextOver]}>
                  {activePresetLength}/{MAX_PROMPT_LENGTH}
                </ThemedText>
              </View>
            </View>
          </SettingSection>
        </View>

        {/* 快捷指令 */}
        <View style={styles.sectionCompact}>
          <View style={styles.quickSectionContainer}>
            <ThemedText style={styles.quickSectionTitle}>快捷指令</ThemedText>
            <View style={styles.quickFilesList}>
              {quickActionConfig.map((item) => (
                <QuickActionFoldCard
                  key={item.key}
                  title={state.quickActionNames[item.key]}
                  defaultTitle={item.defaultLabel}
                  prompt={state.quickActionPrompts[item.key]}
                  promptMaxLength={MAX_QUICK_PROMPT_LENGTH}
                  expanded={expandedQuickActions[item.key]}
                  textColor={textColor}
                  cardColor={cardColor}
                  onToggle={() => toggleQuickAction(item.key)}
                  onDelete={() => handleDeleteQuick(item.key)}
                  onChangeTitle={(value) => setQuickName(item.key, value)}
                  onChangePrompt={(value) => setQuickPrompt(item.key, value)}
                  onFocusTitle={onInputFocus}    // 聚焦 标题
                  onFocusPrompt={onInputFocus}   // 聚焦 文本
                />
              ))}
            </View>
          </View>
        </View>

        {/* 记忆 */}
        {/* 待修改 */}
        <View style={[styles.sectionCompact, styles.memorySectionGap]}>
          <SettingSection title="记忆">
            <View style={[styles.editorCard, { backgroundColor: cardColor }]}>
              <ThemedText style={styles.quickLabel}>长期记忆内容</ThemedText>
              <TextInput
                value={state.memoryContent}
                onChangeText={(value) => {
                  if (countPromptUnits(value) > MAX_MEMORY_CONTENT_LENGTH) return;
                  setState((prev) => ({ ...prev, memoryContent: value }));
                }}
                onFocus={onInputFocus}   // 聚焦
                multiline
                style={[styles.memoryInput, { color: textColor }]}
                placeholder="填写需要长期保留的偏好、约束和背景"
                placeholderTextColor={textColor + '66'}
              />
              <View style={styles.lengthDetector}>
                <ThemedText style={[styles.lengthText, memoryContentLength > MAX_MEMORY_CONTENT_LENGTH && styles.lengthTextOver]}>
                  {memoryContentLength}/{MAX_MEMORY_CONTENT_LENGTH}
                </ThemedText>
              </View>
            </View>
          </SettingSection>
        </View>

        {/* 保存 */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: cardColor, borderColor }]}
          activeOpacity={0.75}
          onPress={handleSave}
          disabled={!loaded}
        >
          <ThemedText style={styles.saveText}>{loaded ? '保存个性化数据' : '正在加载...'}</ThemedText>
        </TouchableOpacity>
        
          </>
        )}
      </KeyboardAwareScroll>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  sectionCompact: {
    marginBottom: -12,
  },
  memorySectionGap: {
    marginTop: 20,
  },
  presetInstructionLinked: {
    marginTop: -14,
  },
  editorCard: {
    borderRadius: 12,
    padding: 12,
  },
  editorTitle: {
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.75,
  },
  multilineInput: {
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  lengthDetector: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  lengthText: {
    fontSize: 12,
    opacity: 0.55,
  },
  lengthTextOver: {
    color: '#ff453a',
    opacity: 1,
  },
  sectionCardBody: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickFilesList: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 6,
  },
  quickSectionContainer: {
    paddingHorizontal: 4,
  },
  quickSectionTitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 6,
    marginLeft: 4,
  },
  quickLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.75,
  },
  quickInput: {
    minHeight: 52,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  memoryBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memoryInput: {
    minHeight: 96,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  memoryGuide: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
    marginTop: -4,
  },
  saveButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
  },
});




