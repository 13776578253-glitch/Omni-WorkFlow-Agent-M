import { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

// Deprecated logic kept for reference.
export function useHomeMaskStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const maskMove = interpolate(translateY.value, [0, -400], [0, -40], Extrapolation.CLAMP);
    return { transform: [{ translateY: maskMove }] };
  });
}

export function useBlurOpacityStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, -200, -800],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });
}
