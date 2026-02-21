import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function HomePortal() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        功能中心
      </ThemedText>
      
      {/* 快捷功能模块占位 */}
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.gridItem}>
            <ThemedText>模块 {i}</ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        最近活动
      </ThemedText>
      <View style={styles.listCard}>
        <ThemedText style={{ opacity: 0.5 }}>暂无最近活动数据...</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    padding: 20,
    paddingBottom: 40, // 底部留白
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    height: 100,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  listCard: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderRadius: 16,
    minHeight: 150,
  }
});