import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { SettingItem } from '@/components/user/Setting_Item';
import { SettingSection } from '@/components/user/Setting_section';
import { useThemeContext } from '@/constants/Theme-Context'; //全局状态 主题

export default function ThemeScreen() {
  const { themeMode, setThemeMode } = useThemeContext();

  const options = [
    { label: '跟随系统', value: 'system' },
    { label: '浅色模式', value: 'light' },
    { label: '深色模式', value: 'dark' },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingSection>
          {options.map((item) => (
            <SettingItem
              key={item.value}
              title={item.label}
              hasArrow={false}                          // 选择页不需要箭头
              selected={themeMode === item.value}       // 判断是否选中
              onPress={() => setThemeMode(item.value)}
            />
          ))}
        </SettingSection>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
});