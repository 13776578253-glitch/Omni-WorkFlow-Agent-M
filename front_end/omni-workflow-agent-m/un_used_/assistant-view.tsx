
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableNativeFeedback,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 安卓原生水波纹按钮封装
const IconButton = ({ onPress, icon, color = "#fff" }: any) => {
  if (Platform.OS === 'android') {
    return (
      <View style={{ borderRadius: 20, overflow: 'hidden' }}>
        <TouchableNativeFeedback 
          onPress={onPress}
          background={TouchableNativeFeedback.Ripple('rgba(255,255,255,0.1)', true)}
        >
          <View style={{ padding: 8 }}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
      <Ionicons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
};

export function AssistantView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        
        <View style={styles.headerTitle}>
          <Ionicons name="sparkles" size={16} color="#4D9EFF" />
          <ThemedText style={styles.titleText}>Gemini</ThemedText>
        </View>

        <IconButton icon="time-outline" onPress={() => {}} />
      </View>

      {/* 中间内容区 */}
      <View style={styles.content}>
        <ThemedText style={styles.greeting}>你好，清源</ThemedText>
        <ThemedText style={styles.subGreeting}>今天想探索什么？</ThemedText>
      </View>

      {/* 底部输入区 */}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.inputWrapper}>
          <TextInput 
            placeholder="输入指令..." 
            placeholderTextColor="#666"
            style={styles.input}
          />
          <View style={styles.micIcon}>
             <Ionicons name="mic" size={20} color="#fff" />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' }, // 保持深色高级感
  header: { 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 8 
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#4D9EFF', marginBottom: 8 },
  subGreeting: { fontSize: 24, color: '#666' },
  bottomArea: { paddingHorizontal: 16 },
  inputWrapper: { 
    flexDirection: 'row', 
    backgroundColor: '#1E1E1E', 
    borderRadius: 30, 
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  input: { flex: 1, height: 44, color: '#fff', paddingHorizontal: 16, fontSize: 16 },
  micIcon: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' 
  }
});