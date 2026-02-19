import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { SharedValue, interpolate, interpolateColor, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

// 定义Tab 类型
interface Tab {
  name: string;
  key: string;
}

interface TopNavBarProps {
  tabs: Tab[];
  scrollOffset: SharedValue<number>;
  position: SharedValue<number>;
  onTabPress: (index: number) => void;
  translateYCompensation?: number;
  containerRef?: React.Ref<any>;
}

interface AnimatedTabItemProps {
  index: number;
  tab: Tab;
  isDark: boolean;
  activeColor: string;
  progress: SharedValue<number>;
  onPress: (index: number) => void;
}

const AnimatedTabItem = ({ index, tab, isDark, activeColor, progress, onPress }: AnimatedTabItemProps) => {
  const animatedTextStyle = useAnimatedStyle(() => {
    // 根据模式设定未激活状态的文字颜色（半透明）
    const inactiveColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
    // 颜色插值
    const color = interpolateColor(
      progress.value,
      [index - 1, index, index + 1],
      [inactiveColor, activeColor, inactiveColor]
    );
    return { color };
  });

  return (
    <TouchableOpacity style={styles.tabItem} onPress={() => onPress(index)}>
      <Animated.Text style={[styles.tabText, animatedTextStyle]}>{tab.name}</Animated.Text>
    </TouchableOpacity>
  );
};

export const TopNavBar = ({ tabs, scrollOffset, position, onTabPress, translateYCompensation = 0, containerRef }: TopNavBarProps) => {
  // const LOG_TAG = '[KB-Compensate-TopNav]';
  const router = useRouter();

  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const themeColors = Colors[effectiveColorScheme];

  const progress = useDerivedValue(() => position.value + scrollOffset.value);
  const navWidth = width * 0.7;  // 定义 Tab 区域的总宽度

  const tabsContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [1.2, 1.7, 2], [1, 0, 0]);
    return { opacity, transform: [{ translateY: 0 }] };
  });

  // 定义搜索框的动画样式
  const searchBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [1.5, 1.9, 2], [0, 1, 1]);
    const scale = interpolate(progress.value, [1.5, 2], [0.95, 1]);  // 搜索框缩放插值
    return {
      opacity,
      transform: [{ scale }],
      pointerEvents: progress.value > 1.8 ? 'auto' : 'none',
      zIndex: progress.value > 1.8 ? 100 : -1,
    };
  });

  // 定义 Tab 指示器的动画样式
  const indicatorStyle = useAnimatedStyle(() => {
    const tabCount = tabs.length || 3;
    const tabWidth = navWidth / tabCount;
    const indicatorW = tabWidth * 0.6;
    const translateX = progress.value * tabWidth + (tabWidth - indicatorW) / 2;
    const opacity = interpolate(progress.value, [1.2, 1.6, 2], [1, 0, 0]);
    return {
      width: indicatorW,
      transform: [{ translateX }],
      opacity,
      backgroundColor: themeColors.text,
    };
  });

  // 测试
  // useEffect(() => {
  //   console.log(`${LOG_TAG} received translateYCompensation=${translateYCompensation}`);
  // }, [translateYCompensation]);

  return (
    <View
      ref={containerRef}
      style={[styles.wrapper, { transform: [{ translateY: translateYCompensation }] }]}
    >
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.container}>
        <View style={styles.safeContent}>
          <View style={styles.iconButton}>
            <SymbolView name="magnifyingglass" size={20} tintColor={themeColors.text} />
          </View>

          <View style={styles.navWrapper}>
            <Animated.View style={[styles.tabsRow, { width: navWidth }, tabsContainerStyle]}>
              {tabs.map((tab, index) => (
                <AnimatedTabItem
                  key={tab.key}
                  tab={tab}
                  index={index}
                  isDark={isDark}
                  activeColor={themeColors.text}
                  progress={progress}
                  onPress={onTabPress}
                />
              ))}
              <Animated.View style={[styles.indicator, indicatorStyle]} />
            </Animated.View>

            <Animated.View style={[StyleSheet.absoluteFill, styles.searchContainer, searchBarStyle]}>
              <View
                style={[
                  styles.searchBox,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <TextInput
                  placeholder="搜索历史记录..."
                  placeholderTextColor={themeColors.text + '60'}
                  style={{ color: themeColors.text, paddingHorizontal: 20, height: 40 }}
                />
              </View>
            </Animated.View>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/user' as any)} activeOpacity={0.7}>
            <SymbolView
              name="line.3.horizontal"
              size={22}
              fallback={<Ionicons name="menu" size={24} color={themeColors.text} />}
            />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    paddingTop: 44,
  },
  safeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 44,
  },
  tabsRow: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  indicator: {
    position: 'absolute',
    bottom: 6,
    height: 2.8,
    left: 0,
    borderRadius: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  searchContainer: {
    position: 'absolute',
    width: '90%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchBox: {
    width: '95%',
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
  },
});
