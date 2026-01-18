import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking'; // 测试 -link模块 连接外部网站 -需要内嵌网站替代
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
// import { Colors } from '@/constants/Colors'; 

import { SettingItem } from '@/components/user/Setting_Item';
import { SettingSection } from '@/components/user/Setting_section';



// --- 3. 用户主界面 ---
export default function UserScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  // const textColor = useThemeColor({}, 'text');
  
  // 模拟登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 处理登录/退出
  const handleAuthAction = () => {
    if (isLoggedIn) {
      Alert.alert('退出登录', '确定要退出当前账号吗？', [
        { text: '取消', style: 'cancel' },
        { text: '确定', style: 'destructive', onPress: () => setIsLoggedIn(false) },
      ]);
    } else {
      // 这里跳转到登录页，或者做登录逻辑
      setIsLoggedIn(true);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* === 模块1: 用户信息 (仿歌单样式) === */}
        <TouchableOpacity 
          style={[styles.userCard, { backgroundColor: cardColor }]}
          onPress={handleAuthAction}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            {/* 暂时用图标代替头像，后面可以用 <Image source={{ uri: ... }} /> */}
            <Ionicons name={isLoggedIn ? "person" : "person-outline"} size={40} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <ThemedText type="title" style={styles.userName}>
              {isLoggedIn ? "Admin User" : "点击登录"}
            </ThemedText>
            <ThemedText style={styles.userToken}>
              {isLoggedIn ? "Token: ax8s...9d2x" : "登录以同步数据"}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color={useThemeColor({}, 'icon')} style={{ opacity: 0.5 }} />
        </TouchableOpacity>

        {/* === 模块2: 应用设置 === */}
        <SettingSection title="应用">
          <SettingItem 
            icon="language" 
            title="语言" 
            value="简体中文" 
            onPress={() => {}} 
          />
          {/* 主题通常是一个二级菜单，或者在这里做一个简单的展示 */}
          <SettingItem 
            icon="moon" 
            title="主题" 
            value="跟随系统" 
            onPress={() => Alert.alert('提示', '目前跟随系统设置，如需强制切换请在系统设置中更改')} 
          />
        </SettingSection>

        {/* === 模块3: 关于 === */}
        <SettingSection title="关于">
          <SettingItem 
            icon="logo-github" 
            title="项目仓库" 
            onPress={() => Linking.openURL('https://github.com/your-repo')} 
          />
          <SettingItem 
            icon="information-circle" 
            title="版本号" 
            value="v1.0.0" 
            hasArrow={false}
          />
          <SettingItem 
            icon="document-text" 
            title="遵循协议" 
            value="MIT" 
          />
        </SettingSection>

        {/* === 模块4: 退出登录 (仅登录时显示) === */}
        {isLoggedIn && (
          <View style={{ marginTop: 24 }}>
             <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: cardColor }]}
                onPress={handleAuthAction}
             >
                <ThemedText style={{ color: '#ff453a', fontWeight: '600', fontSize: 16 }}>退出登录</ThemedText>
             </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // 用户卡片样式
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    // 阴影效果 (iOS only, Android需用elevation)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF', // 品牌色背景
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userToken: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  // 退出按钮样式
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});