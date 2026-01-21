// app/(main)/workflow.tsx
import React from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

// 模拟一些高颜值的 AI 生成图片
const TEST_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
];

export default function WorkflowScreen() {
  const bgColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content} >
      {/* bug 修复白色字体问题 */}
      {/* <ThemedText style={styles.title}>Explore Workflows</ThemedText>   */}
      {/* 待添加逻辑 */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
  },
  content: {
    paddingTop: 110,        // 略大于导航栏高度，留出首屏视觉空间
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  image: {
    width: '100%',
    height: 240,
  },
  cardInfo: {
    padding: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardSub: {
    color: '#888',
    marginTop: 4,
  }
});