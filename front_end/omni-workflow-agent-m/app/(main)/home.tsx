// app/(main)/user.tsx
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useThemeContext } from '@/constants/Theme-Context';
import { useThemeColor } from '@/hooks/use-theme-color';

import { HomeContent } from '@/components/home/Home_Content';
import { useBlurOpacityStyle } from '@/components/home/Home_Content_bin/Home_Content_Animations';
import HomePortal from '@/components/home/Home_Portal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const MECHANICAL_SPRING = {
  damping: 10,                     // 阻尼
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

// 旧逻辑样式 / 存在冗余逻辑 / 保留
export default function HomeScreen({ onDrawerStateChange }: HomeScreenProps) {
  const bgColor = useThemeColor({}, 'background');
  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  // const cardColor = useThemeColor({}, 'card'); // 无用声明

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
      // 垂直滑动并触发位移后，通知父组件锁定 PagerView
      if (onDrawerStateChange) {
        runOnJS(onDrawerStateChange)(true);
      }
      // 记录开始滑动时的位置
      context.value = translateY.value;
    })

    .onUpdate((event) => {
      // context.value 起始位 / event.translationY 手指移动距离
      // let dragResistance = event.translationY > 0 ? 0.4 : 0.85;
      // let nextValue = context.value + (event.translationY * dragResistance);
      // if (nextValue > 0) {
      //   nextValue = nextValue * 0.4;   // 下拉阻尼系数
      // } else if (nextValue < -SCREEN_HEIGHT) {
      //   const overflow = nextValue + SCREEN_HEIGHT;
      //   nextValue = -SCREEN_HEIGHT + overflow * 0.2;
      // } 
      // translateY.value = nextValue;

      const rawNextValue = context.value + event.translationY;
      let finalValue = rawNextValue;

      if (rawNextValue > 0) {
        // 在首页继续下拉（橡皮筋回弹区）/ 阻尼 (0.4)
        finalValue = rawNextValue * 0.4;
      } 
      else if (rawNextValue < -SCREEN_HEIGHT) {
        // 在功能区继续上滑（触底回弹区）/ 阻尼 (0.2)
        const overflow = rawNextValue + SCREEN_HEIGHT;
        finalValue = -SCREEN_HEIGHT + (overflow * 0.2);
      } 
      else {
        // 在首页与功能区之间滑动（正常切换区）
        if (event.translationY < 0) {
          // 向上滑动 / 阻力 (0.65)
          finalValue = context.value + (event.translationY * 0.60);
        } else {
          // 向下滑动 / 阻力 (0.80)
          finalValue = context.value + (event.translationY * 0.75);
        }
      }

      translateY.value = finalValue;
    })

    .onEnd((event) => {
      // 分方向阈值
      const isQuickSwipeDown = event.velocityY > 600;   // 当前在上方/快速下滑 (Velocity>600) -> 释放
      const isQuickSwipeUp = event.velocityY < -1000;   // 当前在下方/快速上滑 (Velocity<-1000) -> 锁定 // 否则根据位置是否过半判定

        // 差异化位置阈值
      const thresholdToPortal = -SCREEN_HEIGHT * 0.5;   // 去功能区 拉过 50%
      const thresholdBackToHome = -SCREEN_HEIGHT * 0.4; // 从功能区回来 拉过 40%
      // const isPastThreshold = translateY.value < -SCREEN_HEIGHT * 0.55;

      // 在拉伸状态松手，回弹到初始位 (0)
      if (translateY.value > 0) {
        translateY.value = withSpring(0, MECHANICAL_SPRING);
        return;
      } 
      
      // 用户在顶层与底层之间切换
      if (isQuickSwipeUp || ( translateY.value < thresholdToPortal && !isQuickSwipeDown)) {
        translateY.value = withSpring(-SCREEN_HEIGHT, MECHANICAL_SPRING);
      } else if ( isQuickSwipeDown || (translateY.value > thresholdBackToHome)){
        translateY.value = withSpring(0, MECHANICAL_SPRING);
      } else {
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
      { translateY: translateY.value < 0 ? translateY.value : 0 },
      // { scale: interpolate(
      //   translateY.value, 
      //   [-SCREEN_HEIGHT, 0], 
      //   [1, 1],   // 上滑缩放
      //   Extrapolation.CLAMP
      // )}
      { scale: 1 }
    ],
    // 下拉时不改变透明度
    opacity: interpolate(
      translateY.value, 
      [-SCREEN_HEIGHT, -SCREEN_HEIGHT * 0.5, 0], 
      [0, 1, 1], 
      Extrapolation.CLAMP
    )
    
  }));

  // 功能区动画
  const portalStyle = useAnimatedStyle(() => ({
    // transform: [{ translateY: translateY.value + SCREEN_HEIGHT }],
    transform: [{ 
    translateY: interpolate(
      translateY.value,
      [-SCREEN_HEIGHT, 0],
      [0, SCREEN_HEIGHT * 0.8], // 初始位置只下沉 80%，产生交叠感，减少空白
      Extrapolation.CLAMP
    )
  }],
  
  opacity: interpolate(translateY.value, [0, -100], [0, 1], Extrapolation.CLAMP)
  }));

  const blurOpacityStyle = useBlurOpacityStyle(translateY);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
          {/* 底层：功能区 */}
          <Animated.View style={[styles.layer, styles.portalLayer, portalStyle, { backgroundColor: bgColor }]}>
            {/* 下拉指示条 /测试/ */}
            {/* <View style={styles.handleBar} /> */}  
            {/* 底部 模块 */}
            <HomePortal />
            <AnimatedBlurView
              intensity={30}
              tint={isDark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, blurOpacityStyle, { zIndex: 10 }]}
              pointerEvents="none"
            />
          </Animated.View>

          {/* 顶层：首页入口 */}
          <Animated.View style={[styles.layer, styles.homeLayer, homeStyle, { backgroundColor: bgColor }]}>
            {/* /测试/  */}
            {/* <View style={[styles.lightAvatar, { backgroundColor: cardColor }]} /> */}
            {/* 顶层 模块 */}
            {/* <HomeContent /> */}
            <HomeContent translateY={translateY} />
          </Animated.View>

        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  homeLayer: {
    backgroundColor: 'transparent', 
    overflow: 'hidden', // 确保内部内容（如 maskPanel）不会因为过高而超出 homeLayer 的范围导致奇怪的截断或白边
  },
  portalLayer: {
    backgroundColor: '#111',
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
