// components/core/top-navbar.tsx
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SharedValue, interpolateColor, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Tab {
  name: string;
  key: string;
}

interface TopNavBarProps {
  tabs: Tab[];
  scrollOffset: SharedValue<number>;
  position: SharedValue<number>;
  onTabPress: (index: number) => void;
}

export const TopNavBar = ({ tabs, scrollOffset, position, onTabPress }: TopNavBarProps) => {
  const router = useRouter();

  // 1. 获取主题状态
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];
  
  const NAV_WIDTH = width * 0.7;  // 导航区域只占屏幕 70%
  const tabWidth = NAV_WIDTH / tabs.length;

  const progress = useDerivedValue(() => {
    return position.value + scrollOffset.value;
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth * 0.4, 
    left: tabWidth * 0.3 + progress.value * tabWidth,
    // transform: [{ translateX: (progress.value * tabWidth) + (tabWidth * 0.2) }],
    backgroundColor: themeColors.text,
  }));

  return (
    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.container}>
      <View style={styles.safeContent}>

        {/*左侧占位*/}
        <View style={styles.iconButton}>
          <SymbolView name="arrow.clockwise" size={20} tintColor="#000" />
        </View>

        {/* 中间 Tab 区域 */}
        <View style={styles.navWrapper}>
          <View style={[styles.tabsRow, { width: NAV_WIDTH }]}>
            {tabs.map((tab, index) => {
              const animatedTextStyle = useAnimatedStyle(() => {
                const activeColor = themeColors.text;
                const inactiveColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
                const color = interpolateColor(
                  progress.value,
                  [index - 1, index, index + 1],
                  [inactiveColor, activeColor, inactiveColor]
                );
                return { color };
              });

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabItem}
                  onPress={() => onTabPress(index)}
                >
                  <Animated.Text style={[styles.tabText, animatedTextStyle]}>
                    {tab.name}
                  </Animated.Text>
                </TouchableOpacity>
              );
            })}
            <Animated.View style={[styles.indicator, indicatorStyle]} />
          </View>
        </View>

        {/*右侧设置按钮*/}
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => router.push('/user' as any)}
        activeOpacity={0.7}
      >
        <SymbolView 
          name="line.3.horizontal" 
          size={22} 
          tintColor="#000" 
          fallback={<Ionicons name="menu" size={24} color={themeColors.text} />}
        />
      </TouchableOpacity>
        
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    height: 44,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14, // 稍微缩小字号
    fontWeight: '700',
    letterSpacing: -0.5, // 紧凑的字间距更有精致感
  },
  indicator: {
    position: 'absolute',
    bottom: 6, // 离文字近一点
    height: 2.5,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 左右图标，中间文字
    paddingHorizontal: 16,
    height: 50,
  },
  navWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 44, // 适配状态栏
    zIndex: 1000,
  },
  safeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});