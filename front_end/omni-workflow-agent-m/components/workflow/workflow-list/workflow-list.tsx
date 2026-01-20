// components/workflow/workflow-list/workflow-list.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// 定义接口，规定父组件必须传一个回调函数进来
interface WorkflowListProps {
  onNewChat: () => void;
}

export function WorkflowList({ onNewChat }: WorkflowListProps) {
  const cardColor = useThemeColor({}, 'card');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={styles.container}>
      {/* 顶部 Header */}
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: cardColor }]}>
          <Ionicons name="search" size={18} color={iconColor} />
          <TextInput 
            placeholder="搜索工作流" 
            style={[styles.searchInput, { color: iconColor }]} 
            placeholderTextColor="#888" 
          />
        </View>
        {/* 点击这里触发回调 */}
        <TouchableOpacity onPress={onNewChat} activeOpacity={0.7}>
          <Ionicons name="add-circle" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 占位内容 */}
        <View style={styles.emptyState}>
          <Ionicons name="git-network-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>暂无工作流，开始一个新的对话吧</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    gap: 12 
  },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    height: 44, 
    borderRadius: 22, 
    gap: 8 
  },
  searchInput: { flex: 1, fontSize: 16 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', opacity: 0.6 },
  emptyText: { marginTop: 16, fontSize: 14, color: '#888' }
});