import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

// 定义组件需要的参数接口
interface ProfileHeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  subTitle?: string;
  onPress: () => void;
}

export function ProfileHeader({ 
  isLoggedIn, 
  userName = "Admin User", // 默认值用于演示，实际应由父组件传入
  subTitle = "Token: ax8s...9d2x", 
  onPress 
}: ProfileHeaderProps) {
  const iconColor = useThemeColor({}, 'icon');
  // 头像背景色，稍微深一点/浅一点以突出
  const avatarBg = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'background');

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 大头像区域 */}
      <View style={[styles.avatarContainer, { backgroundColor: avatarBg }]}>
        <Ionicons 
          name={isLoggedIn ? "person" : "person-outline"} 
          size={44} // 增大图标尺寸
          color={iconColor} 
        />
      </View>

      {/* 信息区域 */}
      <View style={styles.infoContainer}>
        <ThemedText style={styles.nameText}>
          {isLoggedIn ? userName : "点击登录"}
        </ThemedText>
        <ThemedText style={styles.subText}>
          {isLoggedIn ? subTitle : "登录以同步云端数据"}
        </ThemedText>
      </View>

      {/* 右侧箭头 */}
      <Ionicons name="chevron-forward" size={24} color={iconColor} style={styles.arrow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // 加大上下的内边距，营造大气感
    paddingVertical: 30, 
    paddingHorizontal: 20,
    // 移除背景色、阴影、圆角，使其“无边界”
  },
  avatarContainer: {
    width: 80, // 增大头像容器
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 24, // 增大名字字号
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    opacity: 0.6,
  },
  arrow: {
    opacity: 0.5,
  }
});