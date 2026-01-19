// export { useColorScheme } from 'react-native';

import { useThemeContext } from "@/constants/Theme-Context"; // Context 获取生效颜色

export function useColorScheme() {
  // 安全保护  _layout 可能还没加载完 Provider
  try {
    const { effectiveColorScheme } = useThemeContext();
    return effectiveColorScheme;
  } catch (e) {
    return 'light'; // 默认降级
  }
}