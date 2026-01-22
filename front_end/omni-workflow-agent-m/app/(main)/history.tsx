// app/history.tsx
import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  // 模拟数据
  const mockHistory = [
    { id: '1', title: '分析项目架构', date: '10:30' },
    { id: '2', title: '生成主题代码', date: '昨天' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 120 }} // 留出 TopNavBar 的空间
        renderItem={({ item }) => (
          <View style={[styles.card, { borderBottomColor: themeColors.text + '20' }]}>
            <Text style={{ color: themeColors.text, fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: themeColors.text + '60', fontSize: 12 }}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});