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

  const rowCardBg = isDark ? '#232327' : '#ECECEC';
  const iconSlotBg = isDark ? '#2C2C31' : '#E2E2E2';
  const iconWrapBg = isDark ? '#34343A' : '#F0F0F0';
  const titleColor = isDark ? '#F3F4F7' : themeColors.text;
  const subtitleColor = isDark ? '#B2B6C1' : '#8A8A8E';
  const defaultIconColor = isDark ? '#E0E4EE' : '#4B4B4B';

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
          <View style={[styles.iconSlot, { backgroundColor: iconSlotBg }]}>
            <View style={[styles.iconWrap, { backgroundColor: iconWrapBg }]}>
              <MaterialIcons
                name={item.iconName}
                size={21}
                color={item.iconColor || defaultIconColor}
              />
            </View>
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
    width: '87%',
    maxHeight: 380,
    marginTop: 18,
    alignSelf: 'center',
  },
  content: {
    paddingBottom: 20,
  },
  rowCard: {
    minHeight: 72,
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPressed: {
    opacity: 0.72,
  },
  iconSlot: {
    width: 52,
    height: 52,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '500',
  },
});
