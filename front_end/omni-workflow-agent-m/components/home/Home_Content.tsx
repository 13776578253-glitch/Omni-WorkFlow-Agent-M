// homeContent.tsx
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useThemeContext } from '@/constants/Theme-Context';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 测试图片 / 待修改
const LIGHT_BG = '';
const DARK_BG = ''; 

interface HomeContentProps {
  translateY: SharedValue<number>;
}

export function HomeContent({ translateY }: HomeContentProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'background');

  const { effectiveColorScheme } = useThemeContext(); 

  // 背景拉伸动画
  const backgroundStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, 400], 
      [1, 1.2], // 放大倍率
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  // 卡片位移动画
  const maskStyle = useAnimatedStyle(() => {
    const maskMove = interpolate(
      translateY.value,
      [0, 200],
      [0, 60], 
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY: maskMove }] };
  });

  return (
    <View style={styles.container}>

      {/* 背景层 */}
      <View style={styles.backgroundContainer}>
        <Animated.Image
          source={{ uri: effectiveColorScheme === 'dark' ? DARK_BG : LIGHT_BG }}  //根据主题 动态改变背景
          style={[styles.backgroundImage, backgroundStyle]}
          resizeMode="cover"
        />
      </View>

      {/* 内容卡片层 */}
      {/* View 的颜色和卡片背景一致，且高度很大并向下延伸。即使 homeLayer 变透明，遮住底下的功能区背景 */}
      <Animated.View style={[styles.maskPanel, { backgroundColor: cardBg }, maskStyle]}>
        <View style={[styles.bottomFiller, { backgroundColor: cardBg }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,                   // 强制撑满屏幕尺寸，无视父容器对齐
    height: height, 
    position: 'relative',
    backgroundColor: 'transparent', // 确保自身透明
  },
  backgroundContainer: {
    position: 'absolute',
    top: -100,                      // 向上延伸，防止下拉露白
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,                     // 放在最底层
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  maskPanel: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height * 0.22,          // 高度
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#00000015',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  contentPadding: {
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    width: '100%',
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholder: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  bottomFiller: {
    position: 'absolute',
    top: 50, 
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT, 
    zIndex: -1,
  },
});