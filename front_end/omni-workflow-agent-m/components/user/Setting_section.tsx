import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
// import { Colors } from '@/constants/Colors'; 

// 分组卡片组件
export function SettingSection({ children, title }: { children: React.ReactNode; title?: string }) {
  const cardColor = useThemeColor({}, 'card');
  
  return (
    <View style={styles.sectionContainer}>
      {title && <ThemedText style={styles.sectionHeader}>{title}</ThemedText>}
      <View style={[styles.sectionCard, { backgroundColor: cardColor }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase', // 字母大写
  },
  sectionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});