import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; // 软件头部区域 组件

import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking'; // link 组件 -需要内嵌网站替代
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
// import { Colors } from '@/constants/Colors'; 

import { SettingItem } from '@/components/user/Setting_Item';
import { SettingSection } from '@/components/user/Setting_section';

//  用户主界面 
export default function UserScreen() {
  const backgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000' }, 'background');
  const cardColor = useThemeColor({ light: '#FFF', dark: '#1C1C1E' }, 'background');
  // const textColor = useThemeColor({}, 'text');

  // 初始状态头像背景色：暗色背景下浅灰，亮色背景下深灰
  const avatarBg = useThemeColor({ light: '#E5E5EA', dark: '#3A3A3C' }, 'background');
  const iconColor = useThemeColor({}, 'icon');
  
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
        
        {/* 顶部个人简片：去掉复杂的边框，改为简约居中 */}
        <View style={styles.simpleProfile}>
          <View style={[styles.avatarCircle, { backgroundColor: '#E5E5EA' }]}>
            <Ionicons name="person" size={35} color="#8E8E93" />
          </View>
          <ThemedText style={styles.userName}>Guest User</ThemedText>
        </View>

        {/*模块 应用*/}
        <SettingSection title="应用">
          <SettingItem 
            icon="language" 
            title="语言" 
            // value="简体中文" 
            onPress={() => {}} 
          />
          {/* 主题通常是一个二级菜单，或者在这里做一个简单的展示 */}
          <SettingItem 
            icon="moon" 
            title="主题" 
            // value="跟随系统" 
            onPress={() => router.push('/user/theme')} 
          />
          <SettingItem 
            icon="hardware-chip-outline" 
            title="模型" 
            // value="" 
            onPress={() => Alert.alert('提示', '目前无法设置，敬请期待')} 
          />
        </SettingSection>

        {/*模块 关于*/}
        <SettingSection title="关于">
          <SettingItem 
            icon="logo-github" 
            title="项目仓库" 
            onPress={() => Linking.openURL('https://github.com/13776578253-glitch/Omni-WorkFlow-Agent-M')} 
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
            // value="MIT" 
            onPress={() => Alert.alert('提示', '目前无法查看，敬请期待')} 
          />
        </SettingSection>

        {/*模块 退出登录(仅登录时显示)*/}
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
  simpleProfile: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});