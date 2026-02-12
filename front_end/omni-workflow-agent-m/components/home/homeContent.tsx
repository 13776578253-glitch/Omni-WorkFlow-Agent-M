import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function HomeContent() {
  const cardBg = useThemeColor({}, 'card'); // 获取主题定义的卡片背景色

  return (
    <View style={styles.container}>
      {/* 这里的布局你可以随意发挥，目前先写个标准占位 */}
      <View style={[styles.mainCard, { backgroundColor: cardBg }]}>
        <View style={styles.avatarPlaceholder} />
        <ThemedText type="title" style={styles.welcomeText}>
          你好, 开发者
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          哈基米，南北路多
        </ThemedText>
      </View>
      
      <ThemedText style={styles.hintText}>
        ↑ 向上滑动查看更多
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mainCard: {
    width: '90%',
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    // 增加一点 iOS 风格的轻微投影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3478F6', // 暂定一个科技蓝
    marginBottom: 16,
  },
  welcomeText: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.6,
    textAlign: 'center',
  },
  hintText: {
    marginTop: 40,
    opacity: 0.3,
    fontSize: 12,
  }
});