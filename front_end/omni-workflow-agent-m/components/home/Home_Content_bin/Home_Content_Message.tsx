import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

interface CapabilityItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
}

const CAPABILITY_ITEMS: CapabilityItem[] = [
  { id: 'mobile', title: '移动应用', subtitle: '构建原生的 iOS 和 Android 应用程序', iconName: 'smartphone' },
  { id: 'design', title: 'AI 设计', subtitle: '自动化整个设计流程', iconName: 'brush' },
  { id: 'slides', title: 'AI 幻灯片', subtitle: '使用 Nano Banana Pro 创建幻灯片', iconName: 'slideshow' },
  { id: 'browser', title: '浏览器操作员', subtitle: '将一个标签借给 Manus', iconName: 'public' },
  { id: 'research', title: 'Wide Research', subtitle: '大规模并行研究', iconName: 'search' },
//   { id: 'mail', title: '邮件助理', subtitle: '将任何邮件转化为行动', iconName: 'email' },
//   { id: 'skills', title: '代理技能', subtitle: '自动化您的专业知识', iconName: 'extension' },
];

export function HomeContentMessage() {
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled>
      {CAPABILITY_ITEMS.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          android_ripple={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
          onPress={() => {}}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)',
              },
            ]}>
            <MaterialIcons
              name={item.iconName}
              size={22}
              color={isDark ? '#D2D7E3' : '#4B4B4B'}
            />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text
              style={[styles.subtitle, { color: isDark ? '#A7AFC0' : '#8A8A8E' }]}
              numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    maxHeight: 320,
    marginTop: 14,
    alignSelf: 'center',
  },
  content: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowPressed: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
