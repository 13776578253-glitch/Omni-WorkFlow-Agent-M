import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; // 软件头部区域 组件  // 暂时 废弃

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

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 顶部个人名片 */}
        <View style={styles.simpleProfile}>
          <View style={[styles.avatarCircle, { backgroundColor: '#E5E5EA' }]}>
            <Ionicons name="person" size={35} color="#8E8E93" />
          </View>
          <ThemedText style={styles.userName}>Test User</ThemedText>   
          {/* 待修改同步 */}
        </View>

        {/*模块 账户*/}
        <SettingSection title="账户">
          <SettingItem 
            icon="person-circle-outline" 
            title="账号" 
            onPress={() => router.push('/user/auth')} 
          />
          <SettingItem 
            icon="pie-chart-outline"
            title="个性化" 
            onPress={() => router.push('/user/personal')} 
          />
        </SettingSection>

        {/*模块 应用*/}
        <SettingSection title="应用">
          <SettingItem 
            icon="language" 
            title="语言" 
            // value="简体中文" 
            onPress={() => Alert.alert('提示', '目前无法设置，敬请期待')} 
          />
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
        {/* {isLoggedIn && (
          <View style={{ marginTop: 24 }}>
             <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: cardColor }]}
                onPress={handleAuthAction}
             >
                <ThemedText style={{ color: '#ff453a', fontWeight: '600', fontSize: 16 }}>退出登录</ThemedText>
             </TouchableOpacity>
          </View>
        )} */}

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
    // 阴影效果
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
    backgroundColor: '#007AFF', // 背景
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
  // logoutButton: {
  //   padding: 16,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
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