// app/(main)/history.tsx
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

export default function HistoryScreen() {
  const { effectiveColorScheme } = useThemeContext();
  const themeColors = Colors[effectiveColorScheme];

  // 测试数据
  const mockHistory = [
    { id: '1', title: '测试', date: '10:30' },
    { id: '2', title: '实测', date: '10:40' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingTop: 120,
  },
  card: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
