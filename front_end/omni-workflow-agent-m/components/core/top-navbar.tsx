// components/core/top-navbar.tsx
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    SharedValue,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols'; // 或者使用 @expo/vector-icons

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
  // 1. 缩小容器宽度：不再占满全屏，而是占中间一部分
  const NAV_WIDTH = width * 0.7; // 导航区域只占屏幕 70%
  const tabWidth = NAV_WIDTH / tabs.length;

  const progress = useDerivedValue(() => {
    return position.value + scrollOffset.value;
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth * 0.6, // 下划线只占 Tab 宽度的 60%
    transform: [
      { translateX: (progress.value * tabWidth) + (tabWidth * 0.2) } // 居中补偿
    ],
  }));

  return (
    <BlurView intensity={25} tint="light" style={styles.absoluteContainer}>
      <View style={styles.headerContent}>
        
        {/* 1. 左侧占位*/}
        <View style={styles.iconButton}>
          <SymbolView name="arrow.clockwise" size={20} tintColor="#000" />
        </View>

        {/* 中间 Tab 区域 */}
        <View style={styles.navWrapper}>
          <View style={[styles.tabsRow, { width: NAV_WIDTH }]}>
            {tabs.map((tab, index) => {
              const animatedTextStyle = useAnimatedStyle(() => {
                const color = interpolateColor(
                  progress.value,
                  [index - 1, index, index + 1],
                  ['#AAA', '#000', '#AAA']
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
          fallback={<Ionicons name="menu" size={24} color="#1D1D1F" />}
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
});