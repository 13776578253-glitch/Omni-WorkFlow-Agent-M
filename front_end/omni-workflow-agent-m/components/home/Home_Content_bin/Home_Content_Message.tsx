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
  iconColor?: string;
}

const CAPABILITY_ITEMS: CapabilityItem[] = [
  { id: 'interpret', title: '同声传译', subtitle: '零延迟多语种实时互译', iconName: 'interpreter-mode' },
  { id: 'slides', title: 'AI 幻灯片', subtitle: '使用 Nano Banana Pro 创建幻灯片', iconName: 'slideshow' },
  { id: 'doc_processor', title: '文档处理', subtitle: '长篇文献深度解析与重排', iconName: 'auto-stories' },
  { id: 'charting', title: '图表绘制', subtitle: '数据洞察自动视觉化呈现', iconName: 'insights' },
  { id: 'customize', title: '工作流定制', subtitle: '自动化整个工作流程', iconName: 'add', iconColor: '#007bff' },
];

export function HomeContentMessage() {
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  const rowCardBg = isDark ? '#24262C' : '#E9E9EA';
  const iconWrapBg = isDark ? '#3A3E47' : '#F1F1F2';
  const titleColor = isDark ? '#F1F3F8' : '#3E3E41';
  const subtitleColor = isDark ? '#AEB3BF' : '#8E8E92';
  const defaultIconColor = isDark ? '#E4E8F1' : '#474748';

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
          style={({ pressed }) => [styles.rowCard, { backgroundColor: rowCardBg }, pressed && styles.rowPressed]}>
          <View style={[styles.iconWrap, { backgroundColor: iconWrapBg }]}>
            <MaterialIcons
              name={item.iconName}
              size={24}
              color={item.iconColor || defaultIconColor}
            />
          </View>

          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
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
    maxHeight: 385,
    marginTop: 14,
    alignSelf: 'center',
  },
  content: {
    paddingBottom: 10,
  },
  rowCard: {
    minHeight: 68,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPressed: {
    opacity: 0.84,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
