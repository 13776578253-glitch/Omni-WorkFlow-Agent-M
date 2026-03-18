import { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

// 首页背景动画样式 / 待修改
// export function useHomeBackgroundStyle(translateY: SharedValue<number>) {
//   return useAnimatedStyle(() => {
//     const scale = interpolate(translateY.value, [0, 400], [1, 1.2], Extrapolation.CLAMP);
//     return { transform: [{ scale }] };
//   });
// }

// 废弃逻辑 / 保留
// 首页遮罩动画样式 / 顶部遮罩上移
export function useHomeMaskStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    // 根据 home.tsx，上滑时 translateY 为负值，且最终到 -SCREEN_HEIGHT。
    // 在上滑（负值，从 0 到 -400）时，遮罩向上移动（负值，从 0 到 -40）
    const maskMove = interpolate(translateY.value, [0, -400], [0, -40], Extrapolation.CLAMP);
    return { transform: [{ translateY: maskMove }] };
  });
}

// 废弃逻辑 /  保留
// 模糊动画样式 / 控制 BlurView 的 intensity (如果在 Expo BlurView 中支持通过 Animated 属性控制)
// 或者控制包裹层的透明度
export function useBlurOpacityStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    // 假设 -100 为切换的中间状态，这里达到最大模糊(1)，0 和 -SCREEN_HEIGHT 时不模糊(0)
    // 根据实际手势，调整触发区间
    const opacity = interpolate(
      translateY.value,
      [0, -200, -800], // 0: 首页，-200: 滑动中，-800: 完全到底层功能区
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });
}
