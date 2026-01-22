// components/core/top-navbar.tsx
import React from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { SharedValue, interpolate, interpolateColor, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

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

  const progress = useDerivedValue(() => {
    return position.value + scrollOffset.value;
  });

  // 1. Tab 区域的动画样式：在滑向历史页(Index 2)时消失
  const tabsContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [1.2, 1.7, 2], [1, 0, 0]);
    // const translateY = interpolate(progress.value, [1, 2], [0, -10]);
    return { 
      opacity,
      transform: [{ translateY : 0}] 
    };
  });

  // 2. 搜索框动画样式：只在滑向历史页时显示
  const searchBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [1.5, 1.9, 2], [0, 1, 1]);
    const scale = interpolate(progress.value, [1.5, 2], [0.95, 1]);
    return { 
      opacity, 
      transform: [{ scale }],
      pointerEvents: progress.value > 1.8 ? 'auto' : 'none',
      zIndex: progress.value > 1.8 ? 100 : -1
    };
  });

  const NAV_WIDTH = width * 0.7;

  // 2. 修改动画钩子
  const indicatorStyle = useAnimatedStyle(() => {
    // 【关键：在内部实时计算宽度】确保 UI 线程拿到的是最新的 tabs.length
    const currentTabCount = tabs.length || 3; 
    const currentTabWidth = NAV_WIDTH / currentTabCount;
    
    // 【逻辑回归】：使用你觉得最好的 0.3/0.4 比例
    const indicatorW = currentTabWidth * 0.6;
    
    // 使用 translateX 代替 left，这是 Reanimated 性能最好的方式
    // 起始位移是 currentTabWidth * 0.3 (居中)
    // 随进度平移 progress.value * currentTabWidth
    const translateX = (progress.value * currentTabWidth) + (currentTabWidth - indicatorW) / 2;

    // 滑向历史页(Index 2)时平滑消失
    const opacity = interpolate(progress.value, [1.2, 1.6, 2], [1, 0, 0]);

    return {
      width: indicatorW,
      transform: [{ translateX }], // 用位移解决“修改不了”的问题
      opacity,
      backgroundColor: themeColors.text,
    };
  });

  return (
    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.container}>
      <View style={styles.safeContent}>

        {/*左侧占位*/}
        <View style={styles.iconButton}>
          <SymbolView name="magnifyingglass" size={20} tintColor={themeColors.text} />
        </View>

        {/* 中间 Tab 区域 */}
        <View style={styles.navWrapper}>
          {/* <View style={[styles.tabsRow, { width: NAV_WIDTH }]}>
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
          </View> */}
          {/* 模式一：Tabs */}
          <Animated.View style={[styles.tabsRow, { width: NAV_WIDTH }, tabsContainerStyle]}>
            {tabs.map((tab: any, index: number) => {
              const animatedTextStyle = useAnimatedStyle(() => {
                const color = interpolateColor(
                  progress.value,
                  [index - 1, index, index + 1],
                  [isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', themeColors.text, isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)']
                );
                return { color };
              });
              return (
                <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => onTabPress(index)}>
                  <Animated.Text style={[styles.tabText, animatedTextStyle]}>{tab.name}</Animated.Text>
                </TouchableOpacity>
              );
            })}
            <Animated.View style={[styles.indicator, indicatorStyle]} />
          </Animated.View>

          {/* 模式二：搜索框（覆盖在 Tabs 上方） */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.searchContainer, searchBarStyle]}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <TextInput 
                placeholder="搜索历史记录..." 
                placeholderTextColor={themeColors.text + '60'}
                style={{ color: themeColors.text, paddingHorizontal: 20, height: 40 }}
              />
            </View>
          </Animated.View>
        </View>
      

        {/*右侧设置按钮*/}
       <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/user' as any)} activeOpacity={0.7}>
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
    // position: 'relative',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18, // 稍微缩小字号
    fontWeight: '700',
    letterSpacing: -0.2, // 紧凑的字间距更有精致感
  },
  indicator: {
    position: 'absolute',
    bottom: 6, // 离文字近一点
    height: 2.8,
    left: 0,
    // backgroundColor: '#000',
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
    justifyContent: 'center', // 确保内容垂直居中
    position: 'relative',
    height: 44,
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
  searchContainer: {
    position: 'absolute',
    width: '90%', // 搜索框占满中间区域
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 10 },
  searchBox: { 
    width: '95%', 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center' },
});