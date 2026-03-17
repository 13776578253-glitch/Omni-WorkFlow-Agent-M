import { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

// 首页背景动画样式 / 待修改
export function useHomeBackgroundStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const scale = interpolate(translateY.value, [0, 400], [1, 1.2], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });
}

// 首页遮罩动画样式 / 顶部遮罩上移
export function useHomeMaskStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    // 根据 home.tsx，上滑时 translateY 为负值，且最终到 -SCREEN_HEIGHT。
    // 在上滑（负值，从 0 到 -400）时，遮罩向上移动（负值，从 0 到 -40）
    const maskMove = interpolate(translateY.value, [0, -400], [0, -40], Extrapolation.CLAMP);
    return { transform: [{ translateY: maskMove }] };
  });
}
