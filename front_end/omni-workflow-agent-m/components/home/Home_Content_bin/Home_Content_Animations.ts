import { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

// 首页背景动画样式 / 待修改
export function useHomeBackgroundStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const scale = interpolate(translateY.value, [0, 400], [1, 1.2], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });
}

// 首页遮罩动画样式 / 测试
export function useHomeMaskStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const maskMove = interpolate(translateY.value, [0, 200], [0, 60], Extrapolation.CLAMP);
    return { transform: [{ translateY: maskMove }] };
  });
}
