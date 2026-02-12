// app/(main)/user.tsx
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
// @ts-ignore
import Animated, { interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'; // runOnJS 未来将弃用，但不影响此包运行
// import { runOnJS ,scheduleOnRN  } from "react-native-worklets";

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

import { HomeContent } from '@/components/home/homeContent';
import { HomePortal } from '@/components/home/homePortal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MECHANICAL_SPRING = {
  damping: 28,                     // 阻尼
  stiffness: 180,                  // 刚度
  mass: 0.8,                       // 质量
  overshootClamping: true,         // 禁止超过目标点，完全消除果冻晃动
  restDisplacementThreshold: 0.01, // 极小的位移阈值，提前停止计算
  restSpeedThreshold: 0.01,        // 极小的速度阈值
};

// 定义 Props 类型
interface HomeScreenProps {
  onDrawerStateChange?: (isActive: boolean) => void;
}

export default function HomeScreen({ onDrawerStateChange }: HomeScreenProps) {
  const bgColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');

  const translateY = useSharedValue(0);

  const context = useSharedValue(0);

  const gesture = Gesture.Pan()
    // 设置激活阈值  // 垂直滑动超过10像素激活手势，防止过早触发锁死
    .activeOffsetY([-10, 10]) 
    // 如水平移动超过10像素，判定为左右切页，本手势失败
    .failOffsetX([-10, 10])
    .onBegin(() => {
      // 锁死外层的 PagerView，确保垂直滑动不误触左右切页
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(true);
      }
    })
    .onStart(() => {
      // 锁定逻辑移到 onStart  // 垂直滑动并触发位移后，通知父组件锁定 PagerView
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(true);
      }
      // 记录开始滑动时的位置
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      let nextValue = context.value + event.translationY;
      // 限制滑动范围在 [-SCREEN_HEIGHT, 0]  //上部强制锁死 /下部强制锁死
      if (nextValue > 0) nextValue = 0; 
      if (nextValue < -SCREEN_HEIGHT) nextValue = -SCREEN_HEIGHT;
      translateY.value = nextValue;
    })
    .onEnd((event) => {
      // 核心逻辑：判断 锁定/释放
      // 当前在上方/快速下滑 (Velocity>500) -> 释放 
      // 当前在下方/快速上滑 (Velocity<-500) -> 锁定 // 否则根据位置是否过半判定
      const isQuickSwipeDown = event.velocityY > 500;
      const isQuickSwipeUp = event.velocityY < -500;
      const isPastThreshold = translateY.value < -SCREEN_HEIGHT / 2;

      if (isQuickSwipeUp || (isPastThreshold && !isQuickSwipeDown)) {
        // 锁定到顶部 (显示功能区)
        translateY.value = withSpring(-SCREEN_HEIGHT, MECHANICAL_SPRING);
      } else {
        // 回弹到初始位 (显示首页)
        translateY.value = withSpring(0, MECHANICAL_SPRING);
      }
    })
    .onFinalize(() => {
      // 手势结束，释放外层锁定 //重要！
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(false);
      }
    });

  // 首页动画
  const homeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: interpolate(translateY.value, [-SCREEN_HEIGHT, 0], [1.1, 1]) }
    ],
    opacity: interpolate(translateY.value, [-SCREEN_HEIGHT, 0], [0, 1])
  }));

  // 功能区动画
  const portalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + SCREEN_HEIGHT }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
          
          {/* 底层：功能区 */}
          <Animated.View style={[styles.layer, styles.portalLayer, portalStyle, { backgroundColor: bgColor }]}>
            {/* 下拉指示条 /测试/ */}
            {/* <View style={styles.handleBar} /> */}  
            {/* 底部 模块 */}
            <HomePortal />
          </Animated.View>

          {/* 顶层：首页入口 */}
          <Animated.View style={[styles.layer, styles.homeLayer, homeStyle, { backgroundColor: bgColor }]}>
            {/* 测试 /兼容性 */}
            <View style={[styles.lightAvatar, { backgroundColor: cardColor }]} />
            {/* 顶层 模块 */}
            <HomeContent />
          </Animated.View>

        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // 浅灰背景
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  homeLayer: {
    backgroundColor: '#FFFFFF', 
  },
  portalLayer: {
    backgroundColor: '#F5F5F7',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
  },
  lightAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E5E5',
    marginBottom: 15,
  },
  darkUserName: {
    color: '#1D1D1F',
    fontSize: 22,
    fontWeight: '600',
  },
  lightTipText: {
    color: '#86868b',
    marginTop: 8,
  },
  darkText: {
    color: '#1D1D1F',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },
  lightList: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
  },
  lightItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  }
});