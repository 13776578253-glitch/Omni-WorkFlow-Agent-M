// app/(main)/user.tsx
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MECHANICAL_SPRING = {
  damping: 28,                     // 阻尼
  stiffness: 180,                  // 刚度
  mass: 0.8,                       // 质量
  overshootClamping: true,         // 禁止超过目标点，完全消除果冻晃动
  restDisplacementThreshold: 0.01, // 极小的位移阈值，提前停止计算
  restSpeedThreshold: 0.01,        // 极小的速度阈值
};

export default function HomeScreen() {
  const translateY = useSharedValue(0);
  const context = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      // 记录开始滑动时的位置
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      let nextValue = context.value + event.translationY;
      
      // 限制滑动范围在 [-SCREEN_HEIGHT, 0]
      if (nextValue > 0) nextValue = 0;
      if (nextValue < -SCREEN_HEIGHT) nextValue = -SCREEN_HEIGHT;
      
      translateY.value = nextValue;
    })
    .onEnd((event) => {
      // 核心逻辑：判断是想“锁定”还是“释放”
      // 1. 如果当前在上方，且快速下滑 (Velocity > 500) -> 释放
      // 2. 如果当前在下方，且快速上滑 (Velocity < -500) -> 锁定
      // 3. 否则根据位置是否过半判定
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
    });

  // 首页动画：浅色模式下增加一点缩放，衔接更自然
  const homeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: interpolate(translateY.value, [-SCREEN_HEIGHT, 0], [1.1, 1]) }
    ],
    opacity: interpolate(translateY.value, [-SCREEN_HEIGHT, 0], [0, 1])
  }));

  // 功能区动画：从下方升起
  const portalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + SCREEN_HEIGHT }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          
          {/* 底层：浅色功能区 */}
          <Animated.View style={[styles.layer, styles.portalLayer, portalStyle]}>
            {/* 下拉指示条：提示用户可以往下拉 */}
            <View style={styles.handleBar} />
            
            <Text style={styles.darkText}>Settings & Profile</Text>
            <View style={styles.lightList}>
              {['Account', 'Security', 'Privacy', 'About'].map((item) => (
                <View key={item} style={styles.lightItem}>
                  <Text style={{color: '#333'}}>{item}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* 顶层：浅色首页入口 */}
          <Animated.View style={[styles.layer, styles.homeLayer, homeStyle]}>
            <View style={styles.lightAvatar} />
            <Text style={styles.darkUserName}>Welcome Back</Text>
            <Text style={styles.lightTipText}>↑ Swipe up for details</Text>
          </Animated.View>

        </View>
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